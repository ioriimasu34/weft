"""
RFID Platform - API Gateway
FastAPI service with HMAC authentication, rate limiting, and Redis Streams integration
"""

import asyncio
import hashlib
import hmac
import json
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import redis.asyncio as redis
import structlog
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from pydantic import BaseModel, Field, validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from supabase import create_client, Client

from .config import Settings
from .models import CloudEvent, HealthResponse, RFIDRead, ReaderHeartbeat
from .utils import generate_idempotency_key, validate_hmac_signature

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Initialize settings
settings = Settings()

# Initialize FastAPI app
app = FastAPI(
    title="RFID Platform API Gateway",
    description="Enterprise-grade RFID tracking platform API",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts
)

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url,
    enabled=settings.rate_limiting_enabled
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Initialize Redis client
redis_client: Optional[redis.Redis] = None

# Initialize Supabase client
supabase: Optional[Client] = None

# Initialize OpenTelemetry
def setup_telemetry():
    """Setup OpenTelemetry tracing"""
    if not settings.telemetry_enabled:
        return
    
    trace.set_tracer_provider(TracerProvider())
    tracer = trace.get_tracer(__name__)
    
    # Jaeger exporter
    jaeger_exporter = JaegerExporter(
        agent_host_name=settings.jaeger_host,
        agent_port=settings.jaeger_port,
    )
    
    span_processor = BatchSpanProcessor(jaeger_exporter)
    trace.get_tracer_provider().add_span_processor(span_processor)
    
    # Instrument FastAPI and Redis
    FastAPIInstrumentor.instrument_app(app, tracer_provider=trace.get_tracer_provider())
    RedisInstrumentor().instrument()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global redis_client, supabase
    
    logger.info("Starting RFID Platform API Gateway", version="1.0.0")
    
    # Setup telemetry
    setup_telemetry()
    
    # Initialize Redis
    try:
        redis_client = redis.from_url(settings.redis_url, decode_responses=True)
        await redis_client.ping()
        logger.info("Connected to Redis", url=settings.redis_url)
    except Exception as e:
        logger.error("Failed to connect to Redis", error=str(e))
        raise
    
    # Initialize Supabase
    try:
        supabase = create_client(settings.supabase_url, settings.supabase_service_key)
        logger.info("Connected to Supabase", url=settings.supabase_url)
    except Exception as e:
        logger.error("Failed to connect to Supabase", error=str(e))
        raise
    
    logger.info("API Gateway startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global redis_client
    
    logger.info("Shutting down API Gateway")
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis connection closed")

@app.get("/v1/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    start_time = time.time()
    
    # Check Redis connection
    redis_healthy = False
    try:
        if redis_client:
            await redis_client.ping()
            redis_healthy = True
    except Exception:
        pass
    
    # Check Supabase connection
    supabase_healthy = False
    try:
        if supabase:
            # Simple query to test connection
            result = supabase.table("orgs").select("id").limit(1).execute()
            supabase_healthy = True
    except Exception:
        pass
    
    response_time = (time.time() - start_time) * 1000
    
    return HealthResponse(
        ok=redis_healthy and supabase_healthy,
        version="1.0.0",
        uptime=time.time() - start_time,
        services={
            "redis": redis_healthy,
            "supabase": supabase_healthy
        },
        response_time_ms=response_time
    )

@app.post("/v1/ingest/rfid")
@limiter.limit("1000/minute")
async def ingest_rfid_read(
    request: Request,
    event: CloudEvent
) -> JSONResponse:
    """
    Ingest RFID read data via CloudEvents format
    Validates HMAC signature and publishes to Redis Streams
    """
    tracer = trace.get_tracer(__name__)
    
    with tracer.start_as_current_span("ingest_rfid_read") as span:
        span.set_attribute("event.type", event.type)
        span.set_attribute("event.source", event.source)
        span.set_attribute("event.id", event.id)
        
        try:
            # Validate HMAC signature
            device_id = request.headers.get("X-Device-ID")
            timestamp = request.headers.get("X-Timestamp")
            signature = request.headers.get("X-Signature")
            
            if not all([device_id, timestamp, signature]):
                logger.warning("Missing required headers", device_id=device_id)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Missing required headers: X-Device-ID, X-Timestamp, X-Signature"
                )
            
            # Validate timestamp (prevent replay attacks)
            try:
                request_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                current_time = datetime.now(timezone.utc)
                time_diff = abs((current_time - request_time).total_seconds())
                
                if time_diff > 300:  # 5 minutes tolerance
                    logger.warning("Request timestamp too old", time_diff=time_diff)
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Request timestamp too old"
                    )
            except ValueError:
                logger.warning("Invalid timestamp format", timestamp=timestamp)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid timestamp format"
                )
            
            # Get reader info from database
            reader_result = supabase.table("readers").select("*").eq("device_id", device_id).execute()
            if not reader_result.data:
                logger.warning("Unknown device", device_id=device_id)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Unknown device"
                )
            
            reader = reader_result.data[0]
            org_id = reader["org_id"]
            
            # Validate HMAC signature
            if not validate_hmac_signature(
                event.dict(),
                reader["api_key_hash"],
                timestamp,
                signature
            ):
                logger.warning("Invalid HMAC signature", device_id=device_id)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid signature"
                )
            
            # Update reader last seen
            await update_reader_heartbeat(reader["id"])
            
            # Publish to Redis Stream
            stream_key = f"org:{org_id}:rfid"
            message_id = await redis_client.xadd(
                stream_key,
                {
                    "event": json.dumps(event.dict()),
                    "device_id": device_id,
                    "timestamp": timestamp,
                    "processed_at": datetime.now(timezone.utc).isoformat()
                }
            )
            
            logger.info(
                "RFID read ingested",
                org_id=org_id,
                device_id=device_id,
                stream_key=stream_key,
                message_id=message_id,
                epc=event.data.get("epc") if event.data else None
            )
            
            span.set_attribute("org_id", org_id)
            span.set_attribute("device_id", device_id)
            span.set_attribute("message_id", message_id)
            
            return JSONResponse(
                status_code=status.HTTP_202_ACCEPTED,
                content={
                    "message": "RFID read accepted",
                    "message_id": message_id,
                    "org_id": org_id
                }
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Error ingesting RFID read", error=str(e), exc_info=True)
            span.record_exception(e)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

@app.post("/v1/readers/heartbeat")
@limiter.limit("60/minute")
async def reader_heartbeat(
    request: Request,
    heartbeat: ReaderHeartbeat
) -> JSONResponse:
    """Update reader heartbeat and status"""
    try:
        # Validate device
        reader_result = supabase.table("readers").select("*").eq("device_id", heartbeat.device_id).execute()
        if not reader_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reader not found"
            )
        
        reader = reader_result.data[0]
        
        # Update reader status
        update_data = {
            "last_seen_at": datetime.now(timezone.utc).isoformat(),
            "status": heartbeat.status,
            "metadata": heartbeat.metadata or {}
        }
        
        supabase.table("readers").update(update_data).eq("id", reader["id"]).execute()
        
        logger.info("Reader heartbeat updated", device_id=heartbeat.device_id, status=heartbeat.status)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Heartbeat updated"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating reader heartbeat", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/v1/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    if not settings.metrics_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    # Basic metrics
    metrics = {
        "rfid_platform_gateway_requests_total": 0,
        "rfid_platform_gateway_errors_total": 0,
        "rfid_platform_gateway_response_time_seconds": 0.0
    }
    
    return Response(
        content="\n".join([f"{name} {value}" for name, value in metrics.items()]),
        media_type="text/plain"
    )

async def update_reader_heartbeat(reader_id: str):
    """Update reader last seen timestamp"""
    try:
        supabase.table("readers").update({
            "last_seen_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", reader_id).execute()
    except Exception as e:
        logger.error("Failed to update reader heartbeat", reader_id=reader_id, error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development",
        log_level="info"
    )
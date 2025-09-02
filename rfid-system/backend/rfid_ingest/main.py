"""
RFID Ingest Service - Handles RFID reader events and data ingestion
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.requests import Request
from starlette.responses import Response

from shared.models import (
    ScanEventCreate, 
    ScanEvent, 
    RFIDReaderConfig, 
    RFIDReaderStatus,
    APIResponse,
    WebSocketMessage
)
from shared.config import get_settings
from shared.database import get_supabase_client
from shared.auth import get_current_user
from services.rfid_reader import RFIDReaderService
from services.scan_processor import ScanProcessorService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
SCAN_EVENTS_TOTAL = Counter('rfid_scan_events_total', 'Total RFID scan events processed')
SCAN_EVENT_PROCESSING_TIME = Histogram('rfid_scan_event_processing_seconds', 'Time spent processing scan events')
RFID_READER_CONNECTIONS = Counter('rfid_reader_connections_total', 'Total RFID reader connections')

# Global services
rfid_reader_service: RFIDReaderService = None
scan_processor_service: ScanProcessorService = None
redis_client: redis.Redis = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global rfid_reader_service, scan_processor_service, redis_client
    
    # Initialize services
    settings = get_settings()
    
    # Initialize Redis connection
    redis_client = redis.from_url(settings.redis_url)
    await redis_client.ping()
    logger.info("Connected to Redis")
    
    # Initialize RFID reader service
    rfid_reader_service = RFIDReaderService(redis_client)
    await rfid_reader_service.start()
    logger.info("RFID Reader Service started")
    
    # Initialize scan processor service
    scan_processor_service = ScanProcessorService(redis_client)
    await scan_processor_service.start()
    logger.info("Scan Processor Service started")
    
    yield
    
    # Cleanup
    if rfid_reader_service:
        await rfid_reader_service.stop()
    if scan_processor_service:
        await scan_processor_service.stop()
    if redis_client:
        await redis_client.close()
    logger.info("Services stopped")


# Create FastAPI app
app = FastAPI(
    title="RFID Ingest Service",
    description="Service for ingesting and processing RFID reader events",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "RFID Ingest Service", "status": "running"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check Redis connection
        await redis_client.ping()
        
        # Check RFID reader service status
        reader_status = await rfid_reader_service.get_status()
        
        return {
            "status": "healthy",
            "redis": "connected",
            "rfid_readers": reader_status,
            "timestamp": asyncio.get_event_loop().time()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/api/v1/scan-events", response_model=APIResponse)
async def create_scan_event(
    scan_event: ScanEventCreate,
    current_user = Depends(get_current_user)
):
    """Create a new scan event"""
    try:
        start_time = asyncio.get_event_loop().time()
        
        # Process the scan event
        processed_event = await scan_processor_service.process_scan_event(scan_event)
        
        # Record metrics
        SCAN_EVENTS_TOTAL.inc()
        processing_time = asyncio.get_event_loop().time() - start_time
        SCAN_EVENT_PROCESSING_TIME.observe(processing_time)
        
        # Publish to Redis for real-time updates
        await redis_client.publish(
            f"rfid:factory:{scan_event.factory_id}:scans",
            processed_event.json()
        )
        
        logger.info(f"Scan event processed: {processed_event.id}")
        
        return APIResponse(
            success=True,
            message="Scan event created successfully",
            data=processed_event
        )
        
    except Exception as e:
        logger.error(f"Failed to create scan event: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/scan-events", response_model=APIResponse)
async def get_scan_events(
    factory_id: str = None,
    checkpoint_id: str = None,
    tag_id: str = None,
    start_time: str = None,
    end_time: str = None,
    limit: int = 100,
    offset: int = 0,
    current_user = Depends(get_current_user)
):
    """Get scan events with filters"""
    try:
        supabase = get_supabase_client()
        
        # Build query
        query = supabase.table("scan_events").select("*")
        
        if factory_id:
            query = query.eq("factory_id", factory_id)
        if checkpoint_id:
            query = query.eq("checkpoint_id", checkpoint_id)
        if tag_id:
            query = query.eq("tag_id", tag_id)
        if start_time:
            query = query.gte("timestamp", start_time)
        if end_time:
            query = query.lte("timestamp", end_time)
        
        # Apply pagination
        query = query.range(offset, offset + limit - 1)
        query = query.order("timestamp", desc=True)
        
        # Execute query
        response = query.execute()
        
        return APIResponse(
            success=True,
            message="Scan events retrieved successfully",
            data=response.data
        )
        
    except Exception as e:
        logger.error(f"Failed to retrieve scan events: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/rfid-readers/connect")
async def connect_rfid_reader(
    config: RFIDReaderConfig,
    current_user = Depends(get_current_user)
):
    """Connect to an RFID reader"""
    try:
        # Connect to the RFID reader
        reader_id = await rfid_reader_service.connect_reader(config)
        
        RFID_READER_CONNECTIONS.inc()
        
        logger.info(f"Connected to RFID reader: {config.ip_address}")
        
        return APIResponse(
            success=True,
            message="RFID reader connected successfully",
            data={"reader_id": reader_id, "ip_address": config.ip_address}
        )
        
    except Exception as e:
        logger.error(f"Failed to connect to RFID reader: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/rfid-readers/status")
async def get_rfid_readers_status():
    """Get status of all RFID readers"""
    try:
        status = await rfid_reader_service.get_status()
        
        return APIResponse(
            success=True,
            message="RFID reader status retrieved successfully",
            data=status
        )
        
    except Exception as e:
        logger.error(f"Failed to get RFID reader status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/v1/rfid-readers/{reader_id}")
async def disconnect_rfid_reader(
    reader_id: str,
    current_user = Depends(get_current_user)
):
    """Disconnect from an RFID reader"""
    try:
        await rfid_reader_service.disconnect_reader(reader_id)
        
        logger.info(f"Disconnected from RFID reader: {reader_id}")
        
        return APIResponse(
            success=True,
            message="RFID reader disconnected successfully"
        )
        
    except Exception as e:
        logger.error(f"Failed to disconnect RFID reader: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# WebSocket endpoint for real-time scan events
@app.websocket("/ws/scan-events/{factory_id}")
async def websocket_scan_events(websocket: WebSocket, factory_id: str):
    """WebSocket endpoint for real-time scan events"""
    await websocket.accept()
    
    try:
        # Subscribe to Redis channel for this factory
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(f"rfid:factory:{factory_id}:scans")
        
        logger.info(f"WebSocket connected for factory: {factory_id}")
        
        # Send initial connection message
        await websocket.send_text(
            WebSocketMessage(
                type="connection_established",
                data={"factory_id": factory_id, "message": "Connected to scan events"}
            ).json()
        )
        
        # Listen for messages
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    # Parse the scan event data
                    scan_data = message["data"].decode()
                    
                    # Send to WebSocket client
                    await websocket.send_text(scan_data)
                    
                except Exception as e:
                    logger.error(f"Error processing WebSocket message: {e}")
                    await websocket.send_text(
                        WebSocketMessage(
                            type="error",
                            data={"error": "Failed to process scan event"}
                        ).json()
                    )
                    
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for factory: {factory_id}")
    except Exception as e:
        logger.error(f"WebSocket error for factory {factory_id}: {e}")
        try:
            await websocket.close()
        except:
            pass
    finally:
        try:
            await pubsub.unsubscribe(f"rfid:factory:{factory_id}:scans")
            await pubsub.close()
        except:
            pass


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return APIResponse(
        success=False,
        message="Internal server error",
        error=str(exc)
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
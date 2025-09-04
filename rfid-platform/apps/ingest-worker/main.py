"""
RFID Platform - Ingest Worker
Processes RFID reads from Redis Streams and writes to Supabase with deduplication
"""

import asyncio
import json
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional

import redis.asyncio as redis
import structlog
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.redis import RedisInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from supabase import create_client, Client
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import Settings
from .models import CloudEvent, RFIDRead
from .utils import generate_idempotency_key, validate_epc_format

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

# Initialize services
redis_client: Optional[redis.Redis] = None
supabase: Optional[Client] = None
tracer: Optional[trace.Tracer] = None

# Worker configuration
CONSUMER_GROUP = "ingest-workers"
CONSUMER_NAME = f"worker-{settings.worker_id}"
BATCH_SIZE = 100
PENDING_ENTRIES_LIMIT = 1000
IDLE_TIME = 1000  # milliseconds


def setup_telemetry():
    """Setup OpenTelemetry tracing"""
    global tracer
    
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
    
    # Instrument Redis
    RedisInstrumentor().instrument()


async def initialize_services():
    """Initialize Redis and Supabase connections"""
    global redis_client, supabase
    
    # Initialize Redis
    redis_client = redis.from_url(settings.redis_url, decode_responses=True)
    await redis_client.ping()
    logger.info("Connected to Redis", url=settings.redis_url)
    
    # Initialize Supabase
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    logger.info("Connected to Supabase", url=settings.supabase_url)


async def create_consumer_groups():
    """Create consumer groups for all org streams"""
    try:
        # Get all org streams
        keys = await redis_client.keys("org:*:rfid")
        
        for key in keys:
            try:
                # Create consumer group if it doesn't exist
                await redis_client.xgroup_create(
                    key, CONSUMER_GROUP, id="0", mkstream=True
                )
                logger.info("Created consumer group", stream=key, group=CONSUMER_GROUP)
            except redis.ResponseError as e:
                if "BUSYGROUP" in str(e):
                    # Group already exists
                    logger.debug("Consumer group already exists", stream=key, group=CONSUMER_GROUP)
                else:
                    logger.error("Failed to create consumer group", stream=key, error=str(e))
    except Exception as e:
        logger.error("Error creating consumer groups", error=str(e))


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
async def process_rfid_read(event: CloudEvent, org_id: str) -> bool:
    """
    Process a single RFID read event
    Returns True if successfully processed, False otherwise
    """
    if not tracer:
        return await _process_rfid_read_internal(event, org_id)
    
    with tracer.start_as_current_span("process_rfid_read") as span:
        span.set_attribute("org_id", org_id)
        span.set_attribute("event.type", event.type)
        span.set_attribute("event.id", event.id)
        
        try:
            result = await _process_rfid_read_internal(event, org_id)
            span.set_attribute("success", result)
            return result
        except Exception as e:
            span.record_exception(e)
            logger.error("Error processing RFID read", error=str(e), exc_info=True)
            raise


async def _process_rfid_read_internal(event: CloudEvent, org_id: str) -> bool:
    """Internal RFID read processing logic"""
    try:
        # Validate event data
        if not event.data:
            logger.warning("Event data is empty", event_id=event.id)
            return False
        
        # Extract RFID read data
        rfid_data = event.data
        epc = rfid_data.get("epc")
        reader_id = rfid_data.get("reader_id")
        antenna = rfid_data.get("antenna")
        rssi = rfid_data.get("rssi")
        read_at = rfid_data.get("reader_ts")
        
        # Validate required fields
        if not all([epc, reader_id, antenna, rssi, read_at]):
            logger.warning("Missing required RFID data", event_id=event.id, data=rfid_data)
            return False
        
        # Validate EPC format
        if not validate_epc_format(epc):
            logger.warning("Invalid EPC format", epc=epc, event_id=event.id)
            return False
        
        # Parse timestamp
        try:
            if isinstance(read_at, str):
                read_at_dt = datetime.fromisoformat(read_at.replace('Z', '+00:00'))
            else:
                read_at_dt = read_at
        except (ValueError, TypeError):
            logger.warning("Invalid timestamp format", read_at=read_at, event_id=event.id)
            return False
        
        # Generate idempotency key
        idem_key = generate_idempotency_key(org_id, epc, reader_id, antenna, read_at_dt)
        
        # Upsert RFID read with deduplication
        await upsert_rfid_read(
            org_id=org_id,
            epc=epc,
            reader_id=reader_id,
            antenna=antenna,
            rssi=float(rssi),
            read_at=read_at_dt,
            idem_key=idem_key
        )
        
        # Publish summary event for real-time updates
        await publish_summary_event(org_id, epc, reader_id, rssi, read_at_dt)
        
        logger.info(
            "RFID read processed",
            org_id=org_id,
            epc=epc,
            reader_id=reader_id,
            antenna=antenna,
            rssi=rssi,
            idem_key=idem_key
        )
        
        return True
        
    except Exception as e:
        logger.error("Error processing RFID read", error=str(e), exc_info=True)
        return False


async def upsert_rfid_read(
    org_id: str,
    epc: str,
    reader_id: str,
    antenna: int,
    rssi: float,
    read_at: datetime,
    idem_key: str
):
    """Upsert RFID read with deduplication"""
    try:
        # Use Supabase RPC function for atomic upsert
        result = supabase.rpc(
            "upsert_rfid_read",
            {
                "p_org_id": org_id,
                "p_epc": epc,
                "p_reader_id": reader_id,
                "p_antenna": antenna,
                "p_rssi": rssi,
                "p_read_at": read_at.isoformat(),
                "p_idem_key": idem_key
            }
        ).execute()
        
        if result.data:
            logger.debug("RFID read upserted", idem_key=idem_key, result=result.data)
        else:
            logger.warning("RFID read upsert failed", idem_key=idem_key)
            
    except Exception as e:
        logger.error("Error upserting RFID read", error=str(e), idem_key=idem_key)
        raise


async def publish_summary_event(
    org_id: str,
    epc: str,
    reader_id: str,
    rssi: float,
    read_at: datetime
):
    """Publish summary event for real-time updates"""
    try:
        # Create summary event
        summary_event = {
            "type": "rfid.read.summary",
            "org_id": org_id,
            "epc": epc,
            "reader_id": reader_id,
            "rssi": rssi,
            "read_at": read_at.isoformat(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert into events table for Supabase Realtime
        supabase.table("events").insert({
            "org_id": org_id,
            "type": "rfid.read.summary",
            "payload": summary_event
        }).execute()
        
        logger.debug("Summary event published", org_id=org_id, epc=epc)
        
    except Exception as e:
        logger.error("Error publishing summary event", error=str(e), org_id=org_id, epc=epc)


async def process_stream_batch(stream_key: str, messages: List[Dict]) -> int:
    """
    Process a batch of messages from a stream
    Returns number of successfully processed messages
    """
    processed_count = 0
    
    for message_id, fields in messages:
        try:
            # Parse CloudEvent
            event_data = json.loads(fields["event"])
            event = CloudEvent(**event_data)
            
            # Extract org_id from stream key
            org_id = stream_key.split(":")[1]
            
            # Process the event
            success = await process_rfid_read(event, org_id)
            
            if success:
                processed_count += 1
                # Acknowledge the message
                await redis_client.xack(stream_key, CONSUMER_GROUP, message_id)
            else:
                logger.warning("Failed to process message", message_id=message_id, stream=stream_key)
                
        except Exception as e:
            logger.error("Error processing message", message_id=message_id, error=str(e), exc_info=True)
    
    return processed_count


async def consume_streams():
    """Main consumer loop"""
    logger.info("Starting stream consumer", consumer_name=CONSUMER_NAME)
    
    # Create consumer groups
    await create_consumer_groups()
    
    while True:
        try:
            # Get all org streams
            stream_keys = await redis_client.keys("org:*:rfid")
            
            if not stream_keys:
                await asyncio.sleep(1)
                continue
            
            # Read from all streams
            streams = {key: ">" for key in stream_keys}
            messages = await redis_client.xreadgroup(
                CONSUMER_GROUP,
                CONSUMER_NAME,
                streams,
                count=BATCH_SIZE,
                block=IDLE_TIME
            )
            
            total_processed = 0
            
            for stream_key, stream_messages in messages:
                processed = await process_stream_batch(stream_key, stream_messages)
                total_processed += processed
                
                logger.debug(
                    "Processed stream batch",
                    stream=stream_key,
                    processed=processed,
                    total=len(stream_messages)
                )
            
            if total_processed > 0:
                logger.info("Processed messages", count=total_processed)
            
            # Check for pending entries and process them
            await process_pending_entries(stream_keys)
            
        except Exception as e:
            logger.error("Error in consumer loop", error=str(e), exc_info=True)
            await asyncio.sleep(5)  # Back off on error


async def process_pending_entries(stream_keys: List[str]):
    """Process pending entries that weren't acknowledged"""
    for stream_key in stream_keys:
        try:
            # Get pending entries
            pending = await redis_client.xpending_range(
                stream_key,
                CONSUMER_GROUP,
                min="-",
                max="+",
                count=PENDING_ENTRIES_LIMIT
            )
            
            if pending:
                logger.info("Processing pending entries", stream=stream_key, count=len(pending))
                
                # Claim and process pending entries
                for entry in pending:
                    message_id = entry["message_id"]
                    
                    # Claim the message
                    claimed = await redis_client.xclaim(
                        stream_key,
                        CONSUMER_GROUP,
                        CONSUMER_NAME,
                        min_idle_time=60000,  # 1 minute
                        message_ids=[message_id]
                    )
                    
                    if claimed:
                        processed = await process_stream_batch(stream_key, claimed)
                        if processed > 0:
                            logger.info("Processed claimed message", message_id=message_id)
                        
        except Exception as e:
            logger.error("Error processing pending entries", stream=stream_key, error=str(e))


async def main():
    """Main worker function"""
    logger.info("Starting RFID Ingest Worker", worker_id=settings.worker_id)
    
    # Setup telemetry
    setup_telemetry()
    
    # Initialize services
    await initialize_services()
    
    # Start consuming
    try:
        await consume_streams()
    except KeyboardInterrupt:
        logger.info("Worker shutdown requested")
    except Exception as e:
        logger.error("Worker error", error=str(e), exc_info=True)
    finally:
        if redis_client:
            await redis_client.close()
        logger.info("Worker shutdown complete")


if __name__ == "__main__":
    asyncio.run(main())
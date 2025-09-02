"""
RFID Reader Service - Manages connections to RFID readers and processes tag data
"""

import asyncio
import logging
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass

import redis.asyncio as redis
from shared.models import RFIDReaderConfig, RFIDReaderStatus, ScanEventCreate
from shared.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class ReaderConnection:
    """RFID reader connection information"""
    id: str
    config: RFIDReaderConfig
    status: RFIDReaderStatus
    last_heartbeat: datetime
    tags_read: int = 0
    errors: int = 0
    is_connected: bool = False


class RFIDReaderService:
    """Service for managing RFID reader connections and data processing"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.settings = get_settings()
        self.readers: Dict[str, ReaderConnection] = {}
        self.connection_callbacks: List[Callable] = []
        self.scan_callbacks: List[Callable] = []
        self.running = False
        self.heartbeat_task: Optional[asyncio.Task] = None
        
    async def start(self):
        """Start the RFID reader service"""
        if self.running:
            return
            
        self.running = True
        logger.info("Starting RFID Reader Service")
        
        # Start heartbeat monitoring
        self.heartbeat_task = asyncio.create_task(self._heartbeat_monitor())
        
        # Load existing reader configurations from Redis
        await self._load_reader_configs()
        
        logger.info("RFID Reader Service started")
    
    async def stop(self):
        """Stop the RFID reader service"""
        if not self.running:
            return
            
        self.running = False
        logger.info("Stopping RFID Reader Service")
        
        # Stop heartbeat monitoring
        if self.heartbeat_task:
            self.heartbeat_task.cancel()
            try:
                await self.heartbeat_task
            except asyncio.CancelledError:
                pass
        
        # Disconnect all readers
        for reader_id in list(self.readers.keys()):
            await self.disconnect_reader(reader_id)
        
        logger.info("RFID Reader Service stopped")
    
    async def connect_reader(self, config: RFIDReaderConfig) -> str:
        """Connect to an RFID reader"""
        try:
            # Generate unique reader ID
            reader_id = str(uuid.uuid4())
            
            # Create reader connection
            reader = ReaderConnection(
                id=reader_id,
                config=config,
                status=RFIDReaderStatus(
                    ip_address=config.ip_address,
                    connected=False,
                    last_seen=None,
                    tags_read=0,
                    errors=0,
                    uptime_seconds=None
                ),
                last_heartbeat=datetime.utcnow()
            )
            
            # Store reader connection
            self.readers[reader_id] = reader
            
            # Attempt to establish connection
            await self._establish_connection(reader)
            
            # Save configuration to Redis
            await self._save_reader_config(reader_id, config)
            
            # Notify callbacks
            await self._notify_connection_callbacks(reader, True)
            
            logger.info(f"Connected to RFID reader {config.ip_address} with ID {reader_id}")
            return reader_id
            
        except Exception as e:
            logger.error(f"Failed to connect to RFID reader {config.ip_address}: {e}")
            raise
    
    async def disconnect_reader(self, reader_id: str):
        """Disconnect from an RFID reader"""
        try:
            if reader_id not in self.readers:
                return
            
            reader = self.readers[reader_id]
            
            # Close connection
            await self._close_connection(reader)
            
            # Remove from active readers
            del self.readers[reader_id]
            
            # Remove configuration from Redis
            await self._remove_reader_config(reader_id)
            
            # Notify callbacks
            await self._notify_connection_callbacks(reader, False)
            
            logger.info(f"Disconnected from RFID reader {reader_id}")
            
        except Exception as e:
            logger.error(f"Failed to disconnect RFID reader {reader_id}: {e}")
            raise
    
    async def get_status(self) -> List[RFIDReaderStatus]:
        """Get status of all RFID readers"""
        status_list = []
        
        for reader in self.readers.values():
            # Update status with current connection info
            reader.status.connected = reader.is_connected
            reader.status.last_seen = reader.last_heartbeat
            reader.status.tags_read = reader.tags_read
            reader.status.errors = reader.errors
            
            status_list.append(reader.status)
        
        return status_list
    
    async def get_reader_info(self, reader_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific reader"""
        if reader_id not in self.readers:
            return None
        
        reader = self.readers[reader_id]
        
        return {
            "id": reader.id,
            "config": reader.config.dict(),
            "status": reader.status.dict(),
            "last_heartbeat": reader.last_heartbeat.isoformat(),
            "tags_read": reader.tags_read,
            "errors": reader.errors,
            "is_connected": reader.is_connected
        }
    
    async def add_connection_callback(self, callback: Callable):
        """Add a callback for connection events"""
        self.connection_callbacks.append(callback)
    
    async def add_scan_callback(self, callback: Callable):
        """Add a callback for scan events"""
        self.scan_callbacks.append(callback)
    
    async def _establish_connection(self, reader: ReaderConnection):
        """Establish connection to RFID reader"""
        try:
            # Simulate connection establishment
            # In a real implementation, this would connect to the actual RFID reader
            await asyncio.sleep(0.1)  # Simulate connection time
            
            reader.is_connected = True
            reader.status.connected = True
            reader.status.last_seen = datetime.utcnow()
            reader.status.uptime_seconds = 0
            
            logger.info(f"Connection established to RFID reader {reader.config.ip_address}")
            
        except Exception as e:
            logger.error(f"Failed to establish connection to {reader.config.ip_address}: {e}")
            reader.is_connected = False
            reader.status.connected = False
            reader.errors += 1
            raise
    
    async def _close_connection(self, reader: ReaderConnection):
        """Close connection to RFID reader"""
        try:
            reader.is_connected = False
            reader.status.connected = False
            reader.status.uptime_seconds = None
            
            logger.info(f"Connection closed to RFID reader {reader.config.ip_address}")
            
        except Exception as e:
            logger.error(f"Error closing connection to {reader.config.ip_address}: {e}")
    
    async def _heartbeat_monitor(self):
        """Monitor reader heartbeats and connection health"""
        while self.running:
            try:
                current_time = datetime.utcnow()
                
                for reader in list(self.readers.values()):
                    # Check if reader is still responding
                    time_since_heartbeat = (current_time - reader.last_heartbeat).total_seconds()
                    
                    if time_since_heartbeat > self.settings.reader_timeout:
                        logger.warning(f"Reader {reader.id} timeout, reconnecting...")
                        await self._reconnect_reader(reader)
                    elif reader.is_connected:
                        # Update uptime
                        if reader.status.uptime_seconds is not None:
                            reader.status.uptime_seconds += 1
                
                # Send heartbeat to all connected readers
                await self._send_heartbeats()
                
                await asyncio.sleep(1)  # Check every second
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in heartbeat monitor: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def _reconnect_reader(self, reader: ReaderConnection):
        """Reconnect to a reader that has timed out"""
        try:
            # Close existing connection
            await self._close_connection(reader)
            
            # Wait before reconnecting
            await asyncio.sleep(2)
            
            # Attempt to reconnect
            await self._establish_connection(reader)
            
            logger.info(f"Successfully reconnected to reader {reader.id}")
            
        except Exception as e:
            logger.error(f"Failed to reconnect to reader {reader.id}: {e}")
            reader.errors += 1
    
    async def _send_heartbeats(self):
        """Send heartbeat to all connected readers"""
        for reader in self.readers.values():
            if reader.is_connected:
                try:
                    # Simulate sending heartbeat
                    # In a real implementation, this would send a ping to the reader
                    reader.last_heartbeat = datetime.utcnow()
                    
                except Exception as e:
                    logger.error(f"Failed to send heartbeat to reader {reader.id}: {e}")
                    reader.errors += 1
    
    async def _notify_connection_callbacks(self, reader: ReaderConnection, connected: bool):
        """Notify connection event callbacks"""
        for callback in self.connection_callbacks:
            try:
                await callback(reader, connected)
            except Exception as e:
                logger.error(f"Error in connection callback: {e}")
    
    async def _notify_scan_callbacks(self, scan_data: Dict[str, Any]):
        """Notify scan event callbacks"""
        for callback in self.scan_callbacks:
            try:
                await callback(scan_data)
            except Exception as e:
                logger.error(f"Error in scan callback: {e}")
    
    async def _save_reader_config(self, reader_id: str, config: RFIDReaderConfig):
        """Save reader configuration to Redis"""
        try:
            config_key = f"rfid:reader:{reader_id}:config"
            await self.redis_client.set(
                config_key,
                config.json(),
                ex=3600  # Expire in 1 hour
            )
        except Exception as e:
            logger.error(f"Failed to save reader config to Redis: {e}")
    
    async def _remove_reader_config(self, reader_id: str):
        """Remove reader configuration from Redis"""
        try:
            config_key = f"rfid:reader:{reader_id}:config"
            await self.redis_client.delete(config_key)
        except Exception as e:
            logger.error(f"Failed to remove reader config from Redis: {e}")
    
    async def _load_reader_configs(self):
        """Load reader configurations from Redis"""
        try:
            # Get all reader config keys
            pattern = "rfid:reader:*:config"
            keys = await self.redis_client.keys(pattern)
            
            for key in keys:
                try:
                    # Extract reader ID from key
                    reader_id = key.decode().split(":")[2]
                    
                    # Get config data
                    config_data = await self.redis_client.get(key)
                    if config_data:
                        config = RFIDReaderConfig.parse_raw(config_data)
                        
                        # Create reader connection (but don't connect yet)
                        reader = ReaderConnection(
                            id=reader_id,
                            config=config,
                            status=RFIDReaderStatus(
                                ip_address=config.ip_address,
                                connected=False,
                                last_seen=None,
                                tags_read=0,
                                errors=0,
                                uptime_seconds=None
                            ),
                            last_heartbeat=datetime.utcnow()
                        )
                        
                        self.readers[reader_id] = reader
                        logger.info(f"Loaded reader config for {reader_id}")
                        
                except Exception as e:
                    logger.error(f"Failed to load reader config from {key}: {e}")
                    
        except Exception as e:
            logger.error(f"Failed to load reader configs: {e}")
    
    async def process_tag_data(self, reader_id: str, tag_data: Dict[str, Any]):
        """Process tag data from an RFID reader"""
        try:
            if reader_id not in self.readers:
                logger.warning(f"Unknown reader ID: {reader_id}")
                return
            
            reader = self.readers[reader_id]
            
            # Update reader stats
            reader.tags_read += 1
            reader.status.tags_read = reader.tags_read
            reader.last_heartbeat = datetime.utcnow()
            
            # Create scan event
            scan_event = ScanEventCreate(
                factory_id=tag_data.get("factory_id"),
                tag_id=tag_data.get("tag_id"),
                checkpoint_id=tag_data.get("checkpoint_id"),
                scan_type=tag_data.get("scan_type", "checkpoint"),
                timestamp=datetime.utcnow(),
                reader_timestamp=tag_data.get("timestamp"),
                signal_strength=tag_data.get("signal_strength"),
                antenna_number=tag_data.get("antenna_number"),
                read_count=tag_data.get("read_count", 1),
                raw_data=tag_data
            )
            
            # Notify scan callbacks
            await self._notify_scan_callbacks(scan_event.dict())
            
            # Publish to Redis for real-time updates
            await self.redis_client.publish(
                f"rfid:factory:{scan_event.factory_id}:scans",
                scan_event.json()
            )
            
            logger.debug(f"Processed tag data from reader {reader_id}: {tag_data.get('tag_epc', 'unknown')}")
            
        except Exception as e:
            logger.error(f"Failed to process tag data from reader {reader_id}: {e}")
            if reader_id in self.readers:
                self.readers[reader_id].errors += 1
    
    async def simulate_tag_scan(self, reader_id: str, tag_epc: str, **kwargs):
        """Simulate a tag scan for testing purposes"""
        try:
            if reader_id not in self.readers:
                logger.warning(f"Unknown reader ID: {reader_id}")
                return
            
            # Create simulated tag data
            tag_data = {
                "factory_id": kwargs.get("factory_id", "test-factory"),
                "tag_id": kwargs.get("tag_id", str(uuid.uuid4())),
                "checkpoint_id": kwargs.get("checkpoint_id", "test-checkpoint"),
                "scan_type": kwargs.get("scan_type", "checkpoint"),
                "tag_epc": tag_epc,
                "timestamp": datetime.utcnow().isoformat(),
                "signal_strength": kwargs.get("signal_strength", -45),
                "antenna_number": kwargs.get("antenna_number", 1),
                "read_count": kwargs.get("read_count", 1),
                "simulated": True
            }
            
            # Process the simulated tag data
            await self.process_tag_data(reader_id, tag_data)
            
            logger.info(f"Simulated tag scan: {tag_epc} from reader {reader_id}")
            
        except Exception as e:
            logger.error(f"Failed to simulate tag scan: {e}")


# RFID Reader Protocol Handlers
class ImpinjReaderHandler:
    """Handler for Impinj RFID readers"""
    
    def __init__(self, reader_service: RFIDReaderService):
        self.reader_service = reader_service
    
    async def handle_llrp_message(self, message: bytes) -> Dict[str, Any]:
        """Handle LLRP (Low Level Reader Protocol) messages from Impinj readers"""
        try:
            # Parse LLRP message
            # This is a simplified implementation
            # Real implementation would use proper LLRP parsing
            
            message_str = message.decode('utf-8', errors='ignore')
            
            # Extract tag information
            if "RO_ACCESS_REPORT" in message_str:
                return await self._parse_ro_access_report(message_str)
            elif "READER_EVENT_NOTIFICATION" in message_str:
                return await self._parse_reader_event(message_str)
            else:
                logger.debug(f"Unhandled LLRP message type: {message_str[:100]}")
                return {}
                
        except Exception as e:
            logger.error(f"Failed to handle LLRP message: {e}")
            return {}
    
    async def _parse_ro_access_report(self, message: str) -> Dict[str, Any]:
        """Parse RO_ACCESS_REPORT message"""
        try:
            # Simplified parsing - real implementation would be more robust
            tag_data = {
                "message_type": "RO_ACCESS_REPORT",
                "timestamp": datetime.utcnow().isoformat(),
                "tags": []
            }
            
            # Extract tag EPCs and other information
            # This is a placeholder for actual LLRP parsing
            
            return tag_data
            
        except Exception as e:
            logger.error(f"Failed to parse RO_ACCESS_REPORT: {e}")
            return {}
    
    async def _parse_reader_event(self, message: str) -> Dict[str, Any]:
        """Parse READER_EVENT_NOTIFICATION message"""
        try:
            # Simplified parsing - real implementation would be more robust
            event_data = {
                "message_type": "READER_EVENT_NOTIFICATION",
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": "unknown"
            }
            
            return event_data
            
        except Exception as e:
            logger.error(f"Failed to parse READER_EVENT_NOTIFICATION: {e}")
            return {}


class ZebraReaderHandler:
    """Handler for Zebra RFID readers"""
    
    def __init__(self, reader_service: RFIDReaderService):
        self.reader_service = reader_service
    
    async def handle_xml_message(self, message: str) -> Dict[str, Any]:
        """Handle XML messages from Zebra readers"""
        try:
            # Parse XML message
            # This is a simplified implementation
            # Real implementation would use proper XML parsing
            
            if "TagReport" in message:
                return await self._parse_tag_report(message)
            elif "StatusReport" in message:
                return await self._parse_status_report(message)
            else:
                logger.debug(f"Unhandled XML message type: {message[:100]}")
                return {}
                
        except Exception as e:
            logger.error(f"Failed to handle XML message: {e}")
            return {}
    
    async def _parse_tag_report(self, message: str) -> Dict[str, Any]:
        """Parse TagReport message"""
        try:
            # Simplified parsing - real implementation would be more robust
            tag_data = {
                "message_type": "TagReport",
                "timestamp": datetime.utcnow().isoformat(),
                "tags": []
            }
            
            # Extract tag information from XML
            # This is a placeholder for actual XML parsing
            
            return tag_data
            
        except Exception as e:
            logger.error(f"Failed to parse TagReport: {e}")
            return {}
    
    async def _parse_status_report(self, message: str) -> Dict[str, Any]:
        """Parse StatusReport message"""
        try:
            # Simplified parsing - real implementation would be more robust
            status_data = {
                "message_type": "StatusReport",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "unknown"
            }
            
            return status_data
            
        except Exception as e:
            logger.error(f"Failed to parse StatusReport: {e}")
            return {}
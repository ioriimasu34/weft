"""
Scan Processor Service - Handles business logic for RFID scan events
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID

import redis.asyncio as redis
from shared.models import ScanEventCreate, ScanEvent, ProductionTracking, UniformManagement
from shared.database import DatabaseManager
from shared.config import get_settings
import json

logger = logging.getLogger(__name__)


class ScanProcessorService:
    """Service for processing RFID scan events and applying business logic"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.settings = get_settings()
        self.db_manager = DatabaseManager()
        self.running = False
        self.processing_task: Optional[asyncio.Task] = None
        
        # Processing queues
        self.scan_queue: asyncio.Queue = asyncio.Queue()
        self.production_queue: asyncio.Queue = asyncio.Queue()
        self.uniform_queue: asyncio.Queue = asyncio.Queue()
        
        # Cache for frequently accessed data
        self.tag_cache: Dict[str, Dict[str, Any]] = {}
        self.checkpoint_cache: Dict[str, Dict[str, Any]] = {}
        self.user_cache: Dict[str, Dict[str, Any]] = {}
        
    async def start(self):
        """Start the scan processor service"""
        if self.running:
            return
            
        self.running = True
        logger.info("Starting Scan Processor Service")
        
        # Start processing tasks
        self.processing_task = asyncio.create_task(self._process_scans())
        
        # Start cache refresh task
        asyncio.create_task(self._refresh_cache())
        
        logger.info("Scan Processor Service started")
    
    async def stop(self):
        """Stop the scan processor service"""
        if not self.running:
            return
            
        self.running = False
        logger.info("Stopping Scan Processor Service")
        
        # Stop processing task
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        
        logger.info("Scan Processor Service stopped")
    
    async def process_scan_event(self, scan_event: ScanEventCreate) -> ScanEvent:
        """Process a scan event and apply business logic"""
        try:
            # Add to processing queue
            await self.scan_queue.put(scan_event)
            
            # Create the scan event record
            scan_data = scan_event.dict()
            scan_data["id"] = str(UUID(int=0))  # Placeholder ID
            scan_data["created_at"] = datetime.utcnow()
            scan_data["processed"] = False
            
            # Store in database
            stored_event = await self.db_manager.insert("scan_events", scan_data)
            
            # Mark as processed
            await self.db_manager.update("scan_events", stored_event["id"], {"processed": True})
            
            # Apply business logic
            await self._apply_business_logic(scan_event)
            
            # Create response object
            processed_event = ScanEvent(**stored_event)
            
            logger.info(f"Processed scan event: {processed_event.id}")
            return processed_event
            
        except Exception as e:
            logger.error(f"Failed to process scan event: {e}")
            raise
    
    async def _process_scans(self):
        """Background task for processing scan events"""
        while self.running:
            try:
                # Get scan event from queue
                scan_event = await asyncio.wait_for(
                    self.scan_queue.get(), 
                    timeout=1.0
                )
                
                # Process the scan event
                await self._process_single_scan(scan_event)
                
                # Mark as done
                self.scan_queue.task_done()
                
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error processing scan event: {e}")
                await asyncio.sleep(1)  # Wait before retrying
    
    async def _process_single_scan(self, scan_event: ScanEventCreate):
        """Process a single scan event"""
        try:
            # Validate scan event
            await self._validate_scan_event(scan_event)
            
            # Apply business rules
            await self._apply_business_logic(scan_event)
            
            # Update production tracking if applicable
            if scan_event.scan_type in ["entry", "checkpoint", "exit"]:
                await self._update_production_tracking(scan_event)
            
            # Update uniform management if applicable
            if scan_event.scan_type in ["issue", "return"]:
                await self._update_uniform_management(scan_event)
            
            # Generate alerts if needed
            await self._check_alerts(scan_event)
            
            # Update analytics
            await self._update_analytics(scan_event)
            
        except Exception as e:
            logger.error(f"Failed to process scan event: {e}")
            # Log error but don't fail the entire process
    
    async def _validate_scan_event(self, scan_event: ScanEventCreate):
        """Validate scan event data"""
        try:
            # Check if tag exists and is active
            tag = await self._get_tag_info(scan_event.tag_id)
            if not tag:
                raise ValueError(f"Tag {scan_event.tag_id} not found")
            
            if tag.get("status") != "active":
                raise ValueError(f"Tag {scan_event.tag_id} is not active")
            
            # Check if checkpoint exists and is active
            checkpoint = await self._get_checkpoint_info(scan_event.checkpoint_id)
            if not checkpoint:
                raise ValueError(f"Checkpoint {scan_event.checkpoint_id} not found")
            
            if not checkpoint.get("is_active"):
                raise ValueError(f"Checkpoint {scan_event.checkpoint_id} is not active")
            
            # Validate scan type matches checkpoint type
            if scan_event.scan_type != checkpoint.get("checkpoint_type"):
                logger.warning(f"Scan type {scan_event.scan_type} doesn't match checkpoint type {checkpoint.get('checkpoint_type')}")
            
            # Validate signal strength
            if scan_event.signal_strength and scan_event.signal_strength < -80:
                logger.warning(f"Low signal strength: {scan_event.signal_strength} dBm")
            
        except Exception as e:
            logger.error(f"Scan event validation failed: {e}")
            raise
    
    async def _apply_business_logic(self, scan_event: ScanEventCreate):
        """Apply business logic to scan event"""
        try:
            # Get tag and checkpoint information
            tag = await self._get_tag_info(scan_event.tag_id)
            checkpoint = await self._get_checkpoint_info(scan_event.checkpoint_id)
            
            if not tag or not checkpoint:
                return
            
            # Apply different logic based on scan type
            if scan_event.scan_type == "entry":
                await self._handle_entry_scan(scan_event, tag, checkpoint)
            elif scan_event.scan_type == "exit":
                await self._handle_exit_scan(scan_event, tag, checkpoint)
            elif scan_event.scan_type == "checkpoint":
                await self._handle_checkpoint_scan(scan_event, tag, checkpoint)
            elif scan_event.scan_type == "issue":
                await self._handle_issue_scan(scan_event, tag, checkpoint)
            elif scan_event.scan_type == "return":
                await self._handle_return_scan(scan_event, tag, checkpoint)
            
        except Exception as e:
            logger.error(f"Failed to apply business logic: {e}")
    
    async def _handle_entry_scan(self, scan_event: ScanEventCreate, tag: Dict, checkpoint: Dict):
        """Handle entry scan events"""
        try:
            # Check if tag is already in production
            existing_tracking = await self._get_active_production_tracking(scan_event.tag_id)
            
            if existing_tracking:
                logger.warning(f"Tag {scan_event.tag_id} already in production")
                return
            
            # Create new production tracking record
            tracking_data = {
                "factory_id": scan_event.factory_id,
                "tag_id": scan_event.tag_id,
                "line_id": checkpoint.get("line_id"),
                "stage": "entry",
                "started_at": scan_event.timestamp,
                "operator_id": None  # Will be assigned later
            }
            
            await self.db_manager.insert("production_tracking", tracking_data)
            
            # Update line capacity
            if checkpoint.get("line_id"):
                await self._update_line_capacity(checkpoint["line_id"], 1)
            
            logger.info(f"Tag {scan_event.tag_id} entered production at {checkpoint.get('name')}")
            
        except Exception as e:
            logger.error(f"Failed to handle entry scan: {e}")
    
    async def _handle_exit_scan(self, scan_event: ScanEventCreate, tag: Dict, checkpoint: Dict):
        """Handle exit scan events"""
        try:
            # Find active production tracking
            tracking = await self._get_active_production_tracking(scan_event.tag_id)
            
            if not tracking:
                logger.warning(f"Tag {scan_event.tag_id} not found in production")
                return
            
            # Complete the production tracking
            tracking_id = tracking["id"]
            started_at = datetime.fromisoformat(tracking["started_at"])
            completed_at = scan_event.timestamp
            duration = int((completed_at - started_at).total_seconds())
            
            await self.db_manager.update("production_tracking", tracking_id, {
                "completed_at": completed_at.isoformat(),
                "duration_seconds": duration,
                "stage": "finish"
            })
            
            # Update line capacity
            if checkpoint.get("line_id"):
                await self._update_line_capacity(checkpoint["line_id"], -1)
            
            logger.info(f"Tag {scan_event.tag_id} completed production in {duration} seconds")
            
        except Exception as e:
            logger.error(f"Failed to handle exit scan: {e}")
    
    async def _handle_checkpoint_scan(self, scan_event: ScanEventCreate, tag: Dict, checkpoint: Dict):
        """Handle checkpoint scan events"""
        try:
            # Find active production tracking
            tracking = await self._get_active_production_tracking(scan_event.tag_id)
            
            if not tracking:
                logger.warning(f"Tag {scan_event.tag_id} not found in production")
                return
            
            # Update production tracking stage
            tracking_id = tracking["id"]
            stage = checkpoint.get("name", "checkpoint")
            
            await self.db_manager.update("production_tracking", tracking_id, {
                "stage": stage,
                "updated_at": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Tag {scan_event.tag_id} reached checkpoint {stage}")
            
        except Exception as e:
            logger.error(f"Failed to handle checkpoint scan: {e}")
    
    async def _handle_issue_scan(self, scan_event: ScanEventCreate, tag: Dict, checkpoint: Dict):
        """Handle uniform issue scan events"""
        try:
            # Check if uniform management is enabled
            if not self.settings.enable_uniform_management:
                return
            
            # Create uniform management record
            uniform_data = {
                "factory_id": scan_event.factory_id,
                "tag_id": scan_event.tag_id,
                "employee_id": None,  # Will be assigned later
                "uniform_type": tag.get("tag_type", "uniform"),
                "issued_at": scan_event.timestamp,
                "expected_return_at": None,  # Will be set based on policy
                "condition_issued": "new"
            }
            
            await self.db_manager.insert("uniform_management", uniform_data)
            
            logger.info(f"Uniform {scan_event.tag_id} issued at {checkpoint.get('name')}")
            
        except Exception as e:
            logger.error(f"Failed to handle issue scan: {e}")
    
    async def _handle_return_scan(self, scan_event: ScanEventCreate, tag: Dict, checkpoint: Dict):
        """Handle uniform return scan events"""
        try:
            # Check if uniform management is enabled
            if not self.settings.enable_uniform_management:
                return
            
            # Find active uniform management record
            uniform_records = await self.db_manager.get_by_field(
                "uniform_management", 
                "tag_id", 
                scan_event.tag_id
            )
            
            if not uniform_records:
                logger.warning(f"No uniform management record found for tag {scan_event.tag_id}")
                return
            
            # Update the most recent record
            uniform_record = uniform_records[0]
            uniform_id = uniform_record["id"]
            
            await self.db_manager.update("uniform_management", uniform_id, {
                "returned_at": scan_event.timestamp,
                "condition_returned": "returned"
            })
            
            logger.info(f"Uniform {scan_event.tag_id} returned at {checkpoint.get('name')}")
            
        except Exception as e:
            logger.error(f"Failed to handle return scan: {e}")
    
    async def _update_production_tracking(self, scan_event: ScanEventCreate):
        """Update production tracking based on scan event"""
        try:
            # This is handled in the specific scan type handlers
            pass
            
        except Exception as e:
            logger.error(f"Failed to update production tracking: {e}")
    
    async def _update_uniform_management(self, scan_event: ScanEventCreate):
        """Update uniform management based on scan event"""
        try:
            # This is handled in the specific scan type handlers
            pass
            
        except Exception as e:
            logger.error(f"Failed to update uniform management: {e}")
    
    async def _check_alerts(self, scan_event: ScanEventCreate):
        """Check for alerts based on scan event"""
        try:
            # Check for unusual patterns
            await self._check_unusual_patterns(scan_event)
            
            # Check for bottlenecks
            await self._check_bottlenecks(scan_event)
            
            # Check for quality issues
            await self._check_quality_issues(scan_event)
            
        except Exception as e:
            logger.error(f"Failed to check alerts: {e}")
    
    async def _check_unusual_patterns(self, scan_event: ScanEventCreate):
        """Check for unusual scanning patterns"""
        try:
            # Check for rapid successive scans (potential duplicate reads)
            recent_scans = await self.db_manager.get_by_field(
                "scan_events",
                "tag_id",
                scan_event.tag_id
            )
            
            # Filter scans within last minute
            one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
            recent_scans = [
                scan for scan in recent_scans
                if datetime.fromisoformat(scan["timestamp"]) > one_minute_ago
            ]
            
            if len(recent_scans) > 5:  # More than 5 scans in a minute
                logger.warning(f"Unusual scanning pattern detected for tag {scan_event.tag_id}")
                
                # Publish alert
                await self.redis_client.publish(
                    f"rfid:factory:{scan_event.factory_id}:alerts",
                    json.dumps({
                        "type": "unusual_pattern",
                        "tag_id": scan_event.tag_id,
                        "scan_count": len(recent_scans),
                        "timestamp": datetime.utcnow().isoformat()
                    })
                )
                
        except Exception as e:
            logger.error(f"Failed to check unusual patterns: {e}")
    
    async def _check_bottlenecks(self, scan_event: ScanEventCreate):
        """Check for production bottlenecks"""
        try:
            # Get checkpoint information
            checkpoint = await self._get_checkpoint_info(scan_event.checkpoint_id)
            
            if not checkpoint or not checkpoint.get("line_id"):
                return
            
            # Check line capacity
            line = await self._get_line_info(checkpoint["line_id"])
            if not line:
                return
            
            current_capacity = line.get("current_capacity", 0)
            max_capacity = line.get("max_capacity", 150)
            
            # Alert if line is at 90% capacity
            if current_capacity >= max_capacity * 0.9:
                await self.redis_client.publish(
                    f"rfid:factory:{scan_event.factory_id}:alerts",
                    json.dumps({
                        "type": "line_capacity_warning",
                        "line_id": checkpoint["line_id"],
                        "line_name": line.get("name"),
                        "current_capacity": current_capacity,
                        "max_capacity": max_capacity,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                )
                
        except Exception as e:
            logger.error(f"Failed to check bottlenecks: {e}")
    
    async def _check_quality_issues(self, scan_event: ScanEventCreate):
        """Check for quality issues"""
        try:
            # Check signal strength
            if scan_event.signal_strength and scan_event.signal_strength < -70:
                logger.warning(f"Low signal strength detected: {scan_event.signal_strength} dBm")
                
                # Publish quality alert
                await self.redis_client.publish(
                    f"rfid:factory:{scan_event.factory_id}:alerts",
                    json.dumps({
                        "type": "low_signal_strength",
                        "tag_id": scan_event.tag_id,
                        "checkpoint_id": scan_event.checkpoint_id,
                        "signal_strength": scan_event.signal_strength,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                )
                
        except Exception as e:
            logger.error(f"Failed to check quality issues: {e}")
    
    async def _update_analytics(self, scan_event: ScanEventCreate):
        """Update analytics data"""
        try:
            # Update scan count for checkpoint
            checkpoint_key = f"rfid:analytics:checkpoint:{scan_event.checkpoint_id}:scans"
            await self.redis_client.incr(checkpoint_key)
            
            # Update scan count for tag
            tag_key = f"rfid:analytics:tag:{scan_event.tag_id}:scans"
            await self.redis_client.incr(tag_key)
            
            # Update hourly scan count
            hour_key = f"rfid:analytics:hourly:{datetime.utcnow().strftime('%Y-%m-%d-%H')}:scans"
            await self.redis_client.incr(hour_key)
            
            # Set expiry for analytics keys (24 hours)
            await self.redis_client.expire(checkpoint_key, 86400)
            await self.redis_client.expire(tag_key, 86400)
            await self.redis_client.expire(hour_key, 86400)
            
        except Exception as e:
            logger.error(f"Failed to update analytics: {e}")
    
    async def _update_line_capacity(self, line_id: str, change: int):
        """Update production line capacity"""
        try:
            # Get current line info
            line = await self._get_line_info(line_id)
            if not line:
                return
            
            current_capacity = line.get("current_capacity", 0)
            new_capacity = max(0, current_capacity + change)
            
            # Update line capacity
            await self.db_manager.update("production_lines", line_id, {
                "current_capacity": new_capacity
            })
            
            logger.debug(f"Updated line {line_id} capacity: {current_capacity} -> {new_capacity}")
            
        except Exception as e:
            logger.error(f"Failed to update line capacity: {e}")
    
    async def _refresh_cache(self):
        """Refresh cached data periodically"""
        while self.running:
            try:
                # Clear old cache
                self.tag_cache.clear()
                self.checkpoint_cache.clear()
                self.user_cache.clear()
                
                # Wait before next refresh
                await asyncio.sleep(300)  # Refresh every 5 minutes
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Failed to refresh cache: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying
    
    async def _get_tag_info(self, tag_id: str) -> Optional[Dict[str, Any]]:
        """Get tag information from cache or database"""
        try:
            # Check cache first
            if tag_id in self.tag_cache:
                return self.tag_cache[tag_id]
            
            # Get from database
            tag = await self.db_manager.get_by_id("rfid_tags", tag_id)
            
            if tag:
                # Cache the result
                self.tag_cache[tag_id] = tag
            
            return tag
            
        except Exception as e:
            logger.error(f"Failed to get tag info: {e}")
            return None
    
    async def _get_checkpoint_info(self, checkpoint_id: str) -> Optional[Dict[str, Any]]:
        """Get checkpoint information from cache or database"""
        try:
            # Check cache first
            if checkpoint_id in self.checkpoint_cache:
                return self.checkpoint_cache[checkpoint_id]
            
            # Get from database
            checkpoint = await self.db_manager.get_by_id("checkpoints", checkpoint_id)
            
            if checkpoint:
                # Cache the result
                self.checkpoint_cache[checkpoint_id] = checkpoint
            
            return checkpoint
            
        except Exception as e:
            logger.error(f"Failed to get checkpoint info: {e}")
            return None
    
    async def _get_line_info(self, line_id: str) -> Optional[Dict[str, Any]]:
        """Get production line information"""
        try:
            return await self.db_manager.get_by_id("production_lines", line_id)
        except Exception as e:
            logger.error(f"Failed to get line info: {e}")
            return None
    
    async def _get_active_production_tracking(self, tag_id: str) -> Optional[Dict[str, Any]]:
        """Get active production tracking for a tag"""
        try:
            tracking_records = await self.db_manager.get_by_field(
                "production_tracking",
                "tag_id",
                tag_id
            )
            
            # Find the most recent active tracking record
            active_records = [
                record for record in tracking_records
                if not record.get("completed_at")
            ]
            
            if active_records:
                # Return the most recent one
                return max(active_records, key=lambda x: x["started_at"])
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get active production tracking: {e}")
            return None
    
    async def get_scan_statistics(self, factory_id: str, time_range: str = "24h") -> Dict[str, Any]:
        """Get scan statistics for a factory"""
        try:
            # Calculate time range
            if time_range == "24h":
                start_time = datetime.utcnow() - timedelta(hours=24)
            elif time_range == "7d":
                start_time = datetime.utcnow() - timedelta(days=7)
            elif time_range == "30d":
                start_time = datetime.utcnow() - timedelta(days=30)
            else:
                start_time = datetime.utcnow() - timedelta(hours=24)
            
            # Get scan events from database
            scan_events = await self.db_manager.list_records(
                "scan_events",
                filters={"factory_id": factory_id},
                order_by="timestamp",
                limit=1000
            )
            
            # Filter by time range
            filtered_events = [
                event for event in scan_events
                if datetime.fromisoformat(event["timestamp"]) >= start_time
            ]
            
            # Calculate statistics
            total_scans = len(filtered_events)
            unique_tags = len(set(event["tag_id"] for event in filtered_events))
            unique_checkpoints = len(set(event["checkpoint_id"] for event in filtered_events))
            
            # Group by scan type
            scan_types = {}
            for event in filtered_events:
                scan_type = event.get("scan_type", "unknown")
                scan_types[scan_type] = scan_types.get(scan_type, 0) + 1
            
            # Group by hour for time series
            hourly_scans = {}
            for event in filtered_events:
                hour = datetime.fromisoformat(event["timestamp"]).strftime("%Y-%m-%d-%H")
                hourly_scans[hour] = hourly_scans.get(hour, 0) + 1
            
            return {
                "factory_id": factory_id,
                "time_range": time_range,
                "total_scans": total_scans,
                "unique_tags": unique_tags,
                "unique_checkpoints": unique_checkpoints,
                "scan_types": scan_types,
                "hourly_scans": hourly_scans,
                "start_time": start_time.isoformat(),
                "end_time": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get scan statistics: {e}")
            return {}
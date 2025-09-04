"""
RFID Platform - API Gateway Models
Pydantic models for request/response validation
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, validator


class CloudEvent(BaseModel):
    """CloudEvents specification model"""
    
    specversion: str = Field(default="1.0", description="CloudEvents specification version")
    type: str = Field(..., description="Event type")
    source: str = Field(..., description="Event source")
    id: str = Field(..., description="Event ID")
    time: Optional[datetime] = Field(default=None, description="Event timestamp")
    datacontenttype: str = Field(default="application/json", description="Content type")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Event data")
    
    @validator("type")
    def validate_type(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError("Event type must be a non-empty string")
        return v
    
    @validator("source")
    def validate_source(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError("Event source must be a non-empty string")
        return v
    
    @validator("id")
    def validate_id(cls, v):
        if not v or not isinstance(v, str):
            raise ValueError("Event ID must be a non-empty string")
        return v


class RFIDRead(BaseModel):
    """RFID read data model"""
    
    org_id: str = Field(..., description="Organization ID")
    epc: str = Field(..., description="Electronic Product Code")
    tid: Optional[str] = Field(default=None, description="Tag ID")
    antenna: int = Field(..., ge=1, le=8, description="Antenna number")
    rssi: float = Field(..., ge=-100, le=0, description="Received Signal Strength Indicator")
    reader_ts: datetime = Field(..., description="Reader timestamp")
    location_id: Optional[str] = Field(default=None, description="Location ID")
    
    @validator("epc")
    def validate_epc(cls, v):
        if not v or len(v) < 8:
            raise ValueError("EPC must be at least 8 characters")
        return v.upper()


class ReaderHeartbeat(BaseModel):
    """Reader heartbeat model"""
    
    device_id: str = Field(..., description="Device ID")
    status: str = Field(..., description="Reader status")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Additional metadata")
    
    @validator("status")
    def validate_status(cls, v):
        allowed_statuses = ["online", "offline", "maintenance", "error"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {allowed_statuses}")
        return v


class HealthResponse(BaseModel):
    """Health check response model"""
    
    ok: bool = Field(..., description="Overall health status")
    version: str = Field(..., description="API version")
    uptime: float = Field(..., description="Uptime in seconds")
    services: Dict[str, bool] = Field(..., description="Service health status")
    response_time_ms: float = Field(..., description="Response time in milliseconds")


class ErrorResponse(BaseModel):
    """Error response model"""
    
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(default=None, description="Error details")
    code: Optional[str] = Field(default=None, description="Error code")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
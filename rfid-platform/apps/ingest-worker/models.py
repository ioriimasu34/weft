"""
RFID Platform - Ingest Worker Models
"""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class CloudEvent(BaseModel):
    """CloudEvents specification model"""
    
    specversion: str = Field(default="1.0")
    type: str = Field(...)
    source: str = Field(...)
    id: str = Field(...)
    time: Optional[datetime] = Field(default=None)
    datacontenttype: str = Field(default="application/json")
    data: Optional[Dict[str, Any]] = Field(default=None)


class RFIDRead(BaseModel):
    """RFID read data model"""
    
    org_id: str = Field(...)
    epc: str = Field(...)
    reader_id: str = Field(...)
    antenna: int = Field(...)
    rssi: float = Field(...)
    read_at: datetime = Field(...)

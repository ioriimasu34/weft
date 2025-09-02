"""
Shared Pydantic models for the RFID tracking system
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, validator


class UserRole(str, Enum):
    """User roles in the system"""
    ADMIN = "admin"
    HR = "hr"
    SUPERVISOR = "supervisor"
    OPERATOR = "operator"


class TagStatus(str, Enum):
    """RFID tag status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    LOST = "lost"
    DAMAGED = "damaged"


class ScanType(str, Enum):
    """Types of RFID scans"""
    ENTRY = "entry"
    EXIT = "exit"
    CHECKPOINT = "checkpoint"
    ISSUE = "issue"
    RETURN = "return"


class TagType(str, Enum):
    """Types of RFID tags"""
    GARMENT = "garment"
    BUNDLE = "bundle"
    UNIFORM = "uniform"


# Base Models
class BaseModelWithTimestamps(BaseModel):
    """Base model with created_at and updated_at timestamps"""
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class BaseModelWithID(BaseModelWithTimestamps):
    """Base model with ID field"""
    id: UUID


# Factory Models
class FactoryBase(BaseModel):
    """Base factory model"""
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=50, regex=r'^[A-Z0-9_-]+$')
    address: Optional[str] = None
    country: str = "Bangladesh"
    timezone: str = "Asia/Dhaka"
    max_lines: int = Field(10, ge=1, le=100)
    max_tags_per_line: int = Field(150, ge=50, le=1000)


class FactoryCreate(FactoryBase):
    """Factory creation model"""
    pass


class FactoryUpdate(BaseModel):
    """Factory update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    address: Optional[str] = None
    timezone: Optional[str] = None
    max_lines: Optional[int] = Field(None, ge=1, le=100)
    max_tags_per_line: Optional[int] = Field(None, ge=50, le=1000)


class Factory(FactoryBase, BaseModelWithID):
    """Factory model"""
    pass


# User Models
class UserBase(BaseModel):
    """Base user model"""
    employee_id: str = Field(..., min_length=1, max_length=50, regex=r'^[A-Z0-9_-]+$')
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, regex=r'^\+?[0-9\s\-\(\)]+$')
    role: UserRole = UserRole.OPERATOR
    department: Optional[str] = None


class UserCreate(UserBase):
    """User creation model"""
    factory_id: UUID
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """User update model"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, regex=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, regex=r'^\+?[0-9\s\-\(\)]+$')
    role: Optional[UserRole] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase, BaseModelWithID):
    """User model"""
    factory_id: UUID
    is_active: bool = True
    last_login: Optional[datetime] = None


class UserLogin(BaseModel):
    """User login model"""
    email: str
    password: str


class UserResponse(BaseModel):
    """User response model (without sensitive data)"""
    id: UUID
    employee_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str]
    role: UserRole
    department: Optional[str]
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# RFID Tag Models
class RFIDTagBase(BaseModel):
    """Base RFID tag model"""
    tag_epc: str = Field(..., min_length=24, max_length=96, regex=r'^[0-9A-Fa-f]+$')
    tag_type: TagType
    status: TagStatus = TagStatus.ACTIVE
    notes: Optional[str] = None


class RFIDTagCreate(RFIDTagBase):
    """RFID tag creation model"""
    factory_id: UUID
    assigned_to: Optional[UUID] = None


class RFIDTagUpdate(BaseModel):
    """RFID tag update model"""
    status: Optional[TagStatus] = None
    assigned_to: Optional[UUID] = None
    assigned_at: Optional[datetime] = None
    issued_at: Optional[datetime] = None
    expected_return_at: Optional[datetime] = None
    notes: Optional[str] = None


class RFIDTag(RFIDTagBase, BaseModelWithID):
    """RFID tag model"""
    factory_id: UUID
    assigned_to: Optional[UUID] = None
    assigned_at: Optional[datetime] = None
    issued_at: Optional[datetime] = None
    expected_return_at: Optional[datetime] = None


# Production Line Models
class ProductionLineBase(BaseModel):
    """Base production line model"""
    name: str = Field(..., min_length=1, max_length=100)
    line_number: int = Field(..., ge=1)
    max_capacity: int = Field(150, ge=50, le=1000)
    is_active: bool = True


class ProductionLineCreate(ProductionLineBase):
    """Production line creation model"""
    factory_id: UUID


class ProductionLineUpdate(BaseModel):
    """Production line update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    max_capacity: Optional[int] = Field(None, ge=50, le=1000)
    is_active: Optional[bool] = None


class ProductionLine(ProductionLineBase, BaseModelWithID):
    """Production line model"""
    factory_id: UUID
    current_capacity: int = 0


# Checkpoint Models
class CheckpointBase(BaseModel):
    """Base checkpoint model"""
    name: str = Field(..., min_length=1, max_length=100)
    location: Optional[str] = None
    checkpoint_type: ScanType
    line_id: Optional[UUID] = None
    reader_ip: Optional[str] = Field(None, regex=r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+$')
    reader_port: Optional[int] = Field(None, ge=1, le=65535)
    is_active: bool = True


class CheckpointCreate(CheckpointBase):
    """Checkpoint creation model"""
    factory_id: UUID


class CheckpointUpdate(BaseModel):
    """Checkpoint update model"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = None
    checkpoint_type: Optional[ScanType] = None
    line_id: Optional[UUID] = None
    reader_ip: Optional[str] = Field(None, regex=r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^[0-9a-fA-F:]+$')
    reader_port: Optional[int] = Field(None, ge=1, le=65535)
    is_active: Optional[bool] = None


class Checkpoint(CheckpointBase, BaseModelWithID):
    """Checkpoint model"""
    factory_id: UUID


# Scan Event Models
class ScanEventBase(BaseModel):
    """Base scan event model"""
    scan_type: ScanType
    timestamp: datetime
    reader_timestamp: Optional[datetime] = None
    signal_strength: Optional[int] = Field(None, ge=-100, le=0)  # RSSI in dBm
    antenna_number: Optional[int] = Field(None, ge=1, le=8)
    read_count: int = Field(1, ge=1)
    raw_data: Optional[Dict[str, Any]] = None


class ScanEventCreate(ScanEventBase):
    """Scan event creation model"""
    factory_id: UUID
    tag_id: UUID
    checkpoint_id: UUID


class ScanEvent(ScanEventBase, BaseModelWithID):
    """Scan event model"""
    factory_id: UUID
    tag_id: UUID
    checkpoint_id: UUID
    processed: bool = False


# Production Tracking Models
class ProductionTrackingBase(BaseModel):
    """Base production tracking model"""
    stage: str = Field(..., min_length=1, max_length=50)
    operator_id: Optional[UUID] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    quality_score: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class ProductionTrackingCreate(ProductionTrackingBase):
    """Production tracking creation model"""
    factory_id: UUID
    tag_id: UUID
    line_id: UUID


class ProductionTrackingUpdate(BaseModel):
    """Production tracking update model"""
    stage: Optional[str] = Field(None, min_length=1, max_length=50)
    operator_id: Optional[UUID] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    quality_score: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None


class ProductionTracking(ProductionTrackingBase, BaseModelWithID):
    """Production tracking model"""
    factory_id: UUID
    tag_id: UUID
    line_id: UUID


# Uniform Management Models
class UniformManagementBase(BaseModel):
    """Base uniform management model"""
    uniform_type: str = Field(..., min_length=1, max_length=100)
    size: Optional[str] = None
    issued_at: datetime
    expected_return_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    condition_issued: str = "new"
    condition_returned: Optional[str] = None
    notes: Optional[str] = None


class UniformManagementCreate(UniformManagementBase):
    """Uniform management creation model"""
    factory_id: UUID
    tag_id: UUID
    employee_id: UUID


class UniformManagementUpdate(BaseModel):
    """Uniform management update model"""
    uniform_type: Optional[str] = Field(None, min_length=1, max_length=100)
    size: Optional[str] = None
    expected_return_at: Optional[datetime] = None
    returned_at: Optional[datetime] = None
    condition_returned: Optional[str] = None
    notes: Optional[str] = None


class UniformManagement(UniformManagementBase, BaseModelWithID):
    """Uniform management model"""
    factory_id: UUID
    tag_id: UUID
    employee_id: UUID


# Dashboard Models
class FactoryDashboard(BaseModel):
    """Factory dashboard data"""
    factory_id: UUID
    factory_name: str
    factory_code: str
    total_employees: int
    total_tags: int
    total_lines: int
    total_checkpoints: int
    total_scans_today: int


class ScanEventSummary(BaseModel):
    """Scan event summary for dashboard"""
    checkpoint_name: str
    scan_count: int
    last_scan: Optional[datetime]
    tags_scanned: int


# API Response Models
class APIResponse(BaseModel):
    """Standard API response model"""
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None


class PaginatedResponse(BaseModel):
    """Paginated response model"""
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


# RFID Reader Models
class RFIDReaderConfig(BaseModel):
    """RFID reader configuration"""
    ip_address: str
    port: int = 5084
    username: Optional[str] = None
    password: Optional[str] = None
    antenna_power: int = Field(30, ge=0, le=30)  # dBm
    read_mode: str = "dense"  # dense, sparse, fast
    session: int = Field(0, ge=0, le=3)


class RFIDReaderStatus(BaseModel):
    """RFID reader status"""
    ip_address: str
    connected: bool
    last_seen: Optional[datetime] = None
    tags_read: int = 0
    errors: int = 0
    uptime_seconds: Optional[int] = None


# WebSocket Models
class WebSocketMessage(BaseModel):
    """WebSocket message model"""
    type: str
    data: Any
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ScanEventWS(WebSocketMessage):
    """WebSocket scan event message"""
    type: str = "scan_event"
    data: ScanEvent


class SystemStatusWS(WebSocketMessage):
    """WebSocket system status message"""
    type: str = "system_status"
    data: Dict[str, Any]
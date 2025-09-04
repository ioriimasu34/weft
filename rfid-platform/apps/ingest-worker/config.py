"""
RFID Platform - Ingest Worker Configuration
"""

from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Ingest worker settings"""
    
    # Environment
    environment: str = Field(default="development", env="ENVIRONMENT")
    worker_id: str = Field(default="worker-1", env="WORKER_ID")
    
    # Database
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_service_key: str = Field(..., env="SUPABASE_SERVICE_KEY")
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Monitoring
    telemetry_enabled: bool = Field(default=True, env="TELEMETRY_ENABLED")
    jaeger_host: str = Field(default="localhost", env="JAEGER_HOST")
    jaeger_port: int = Field(default=14268, env="JAEGER_PORT")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

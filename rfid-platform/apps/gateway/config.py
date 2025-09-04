"""
RFID Platform - API Gateway Configuration
Pydantic settings for environment-based configuration
"""

from typing import List, Optional
from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    
    # Security
    secret_key: str = Field(..., env="SECRET_KEY")
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "https://localhost:3000"],
        env="ALLOWED_ORIGINS"
    )
    allowed_hosts: List[str] = Field(
        default=["localhost", "127.0.0.1"],
        env="ALLOWED_HOSTS"
    )
    
    # Database
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_service_key: str = Field(..., env="SUPABASE_SERVICE_KEY")
    
    # Redis
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # Rate Limiting
    rate_limiting_enabled: bool = Field(default=True, env="RATE_LIMITING_ENABLED")
    
    # Monitoring & Observability
    telemetry_enabled: bool = Field(default=True, env="TELEMETRY_ENABLED")
    metrics_enabled: bool = Field(default=True, env="METRICS_ENABLED")
    
    # Jaeger
    jaeger_host: str = Field(default="localhost", env="JAEGER_HOST")
    jaeger_port: int = Field(default=14268, env="JAEGER_PORT")
    
    # Sentry
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")
    
    @validator("allowed_origins", pre=True)
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("allowed_hosts", pre=True)
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = False
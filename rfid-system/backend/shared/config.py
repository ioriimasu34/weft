"""
Configuration management for the RFID tracking system
"""

import os
from typing import Optional
from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "StitchOS RFID Tracking System"
    app_version: str = "1.0.0"
    debug: bool = Field(False, env="DEBUG")
    
    # Server
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8001, env="PORT")
    
    # Database
    database_url: str = Field(
        "postgresql://rfid_user:rfid_password@localhost:5432/rfid_tracking",
        env="DATABASE_URL"
    )
    
    # Supabase
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_anon_key: str = Field(..., env="SUPABASE_ANON_KEY")
    supabase_service_key: str = Field(..., env="SUPABASE_SERVICE_KEY")
    
    # Redis
    redis_url: str = Field("redis://localhost:6379", env="REDIS_URL")
    redis_password: Optional[str] = Field(None, env="REDIS_PASSWORD")
    redis_db: int = Field(0, env="REDIS_DB")
    
    # JWT Authentication
    jwt_secret: str = Field(..., env="JWT_SECRET")
    jwt_algorithm: str = Field("HS256", env="JWT_ALGORITHM")
    jwt_expiration_hours: int = Field(24, env="JWT_EXPIRATION_HOURS")
    
    # RFID Reader Configuration
    default_reader_port: int = Field(5084, env="DEFAULT_READER_PORT")
    reader_timeout: int = Field(30, env="READER_TIMEOUT")
    max_reader_connections: int = Field(10, env="MAX_READER_CONNECTIONS")
    
    # Security
    cors_origins: list = Field(["*"], env="CORS_ORIGINS")
    trusted_hosts: list = Field(["*"], env="TRUSTED_HOSTS")
    encryption_key: str = Field(..., env="ENCRYPTION_KEY")
    
    # Logging
    log_level: str = Field("INFO", env="LOG_LEVEL")
    log_format: str = Field(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    # Monitoring
    prometheus_enabled: bool = Field(True, env="PROMETHEUS_ENABLED")
    metrics_port: int = Field(9090, env="METRICS_PORT")
    
    # Rate Limiting
    rate_limit_requests: int = Field(100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(60, env="RATE_LIMIT_WINDOW")  # seconds
    
    # File Upload
    max_file_size: int = Field(10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    allowed_file_types: list = Field([".csv", ".xlsx", ".json"], env="ALLOWED_FILE_TYPES")
    
    # Email (for notifications)
    smtp_host: Optional[str] = Field(None, env="SMTP_HOST")
    smtp_port: Optional[int] = Field(None, env="SMTP_PORT")
    smtp_username: Optional[str] = Field(None, env="SMTP_USERNAME")
    smtp_password: Optional[str] = Field(None, env="SMTP_PASSWORD")
    smtp_use_tls: bool = Field(True, env="SMTP_USE_TLS")
    
    # SMS (for alerts)
    twilio_account_sid: Optional[str] = Field(None, env="TWILIO_ACCOUNT_SID")
    twilio_auth_token: Optional[str] = Field(None, env="TWILIO_AUTH_TOKEN")
    twilio_phone_number: Optional[str] = Field(None, env="TWILIO_PHONE_NUMBER")
    
    # External APIs
    weather_api_key: Optional[str] = Field(None, env="WEATHER_API_KEY")
    google_maps_api_key: Optional[str] = Field(None, env="GOOGLE_MAPS_API_KEY")
    
    # Feature Flags
    enable_uniform_management: bool = Field(True, env="ENABLE_UNIFORM_MANAGEMENT")
    enable_production_tracking: bool = Field(True, env="ENABLE_PRODUCTION_TRACKING")
    enable_analytics: bool = Field(True, env="ENABLE_ANALYTICS")
    enable_notifications: bool = Field(True, env="ENABLE_NOTIFICATIONS")
    
    # Performance
    max_connections: int = Field(100, env="MAX_CONNECTIONS")
    connection_timeout: int = Field(30, env="CONNECTION_TIMEOUT")
    request_timeout: int = Field(60, env="REQUEST_TIMEOUT")
    
    # Cache
    cache_ttl: int = Field(300, env="CACHE_TTL")  # 5 minutes
    cache_max_size: int = Field(1000, env="CACHE_MAX_SIZE")
    
    # Backup
    backup_enabled: bool = Field(True, env="BACKUP_ENABLED")
    backup_schedule: str = Field("0 2 * * *", env="BACKUP_SCHEDULE")  # Daily at 2 AM
    backup_retention_days: int = Field(30, env="BACKUP_RETENTION_DAYS")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get application settings singleton"""
    global _settings
    
    if _settings is None:
        _settings = Settings()
    
    return _settings


def reload_settings() -> Settings:
    """Reload application settings"""
    global _settings
    _settings = Settings()
    return _settings


# Environment-specific configurations
class DevelopmentSettings(Settings):
    """Development environment settings"""
    debug: bool = True
    log_level: str = "DEBUG"
    cors_origins: list = ["http://localhost:3000", "http://localhost:3001"]
    trusted_hosts: list = ["localhost", "127.0.0.1"]


class ProductionSettings(Settings):
    """Production environment settings"""
    debug: bool = False
    log_level: str = "WARNING"
    cors_origins: list = []  # Configure with actual domains
    trusted_hosts: list = []  # Configure with actual domains
    prometheus_enabled: bool = True


class TestingSettings(Settings):
    """Testing environment settings"""
    debug: bool = True
    log_level: str = "DEBUG"
    database_url: str = "postgresql://test_user:test_pass@localhost:5432/rfid_test"
    redis_url: str = "redis://localhost:6379/1"
    prometheus_enabled: bool = False


def get_environment_settings() -> Settings:
    """Get environment-specific settings"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()


# Configuration validation
def validate_settings(settings: Settings) -> bool:
    """Validate application settings"""
    try:
        # Check required fields
        if not settings.supabase_url:
            raise ValueError("SUPABASE_URL is required")
        if not settings.supabase_anon_key:
            raise ValueError("SUPABASE_ANON_KEY is required")
        if not settings.supabase_service_key:
            raise ValueError("SUPABASE_SERVICE_KEY is required")
        if not settings.jwt_secret:
            raise ValueError("JWT_SECRET is required")
        if not settings.encryption_key:
            raise ValueError("ENCRYPTION_KEY is required")
        
        # Validate URLs
        if not settings.supabase_url.startswith(("http://", "https://")):
            raise ValueError("SUPABASE_URL must be a valid HTTP/HTTPS URL")
        if not settings.redis_url.startswith(("redis://", "rediss://")):
            raise ValueError("REDIS_URL must be a valid Redis URL")
        
        # Validate numeric fields
        if settings.port < 1 or settings.port > 65535:
            raise ValueError("PORT must be between 1 and 65535")
        if settings.jwt_expiration_hours < 1:
            raise ValueError("JWT_EXPIRATION_HOURS must be at least 1")
        if settings.rate_limit_requests < 1:
            raise ValueError("RATE_LIMIT_REQUESTS must be at least 1")
        
        return True
        
    except Exception as e:
        print(f"Configuration validation failed: {e}")
        return False


# Load and validate settings on import
if __name__ == "__main__":
    # Test configuration loading
    try:
        settings = get_environment_settings()
        if validate_settings(settings):
            print("✅ Configuration loaded successfully")
            print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
            print(f"App Name: {settings.app_name}")
            print(f"Debug Mode: {settings.debug}")
            print(f"Database: {settings.database_url}")
            print(f"Redis: {settings.redis_url}")
        else:
            print("❌ Configuration validation failed")
    except Exception as e:
        print(f"❌ Failed to load configuration: {e}")
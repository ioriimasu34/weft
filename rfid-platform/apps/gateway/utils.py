"""
RFID Platform - API Gateway Utilities
Helper functions for HMAC validation, idempotency, and other utilities
"""

import hashlib
import hmac
import json
from datetime import datetime, timezone
from typing import Any, Dict


def generate_idempotency_key(org_id: str, epc: str, reader_id: str, antenna: int, read_at: datetime) -> str:
    """
    Generate idempotency key for RFID reads
    Uses SHA1 hash of org_id + epc + reader_id + antenna + timestamp (rounded to 1 second)
    """
    # Round timestamp to 1 second for deduplication
    rounded_timestamp = int(read_at.timestamp())
    
    # Create hash input
    hash_input = f"{org_id}{epc}{reader_id}{antenna}{rounded_timestamp}"
    
    # Generate SHA1 hash
    return hashlib.sha1(hash_input.encode('utf-8')).hexdigest()


def validate_hmac_signature(
    event_data: Dict[str, Any],
    api_key_hash: str,
    timestamp: str,
    signature: str
) -> bool:
    """
    Validate HMAC signature for incoming requests
    """
    try:
        # Create signature payload
        payload = json.dumps(event_data, sort_keys=True, separators=(',', ':'))
        message = f"{timestamp}{payload}"
        
        # Extract algorithm and signature from header
        if not signature.startswith("sha256="):
            return False
        
        provided_signature = signature[7:]  # Remove "sha256=" prefix
        
        # Generate expected signature
        # Note: In production, you would use the actual API key, not the hash
        # For now, we'll use a placeholder validation
        expected_signature = hmac.new(
            api_key_hash.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures using constant-time comparison
        return hmac.compare_digest(provided_signature, expected_signature)
        
    except Exception:
        return False


def create_hmac_signature(
    event_data: Dict[str, Any],
    api_key: str,
    timestamp: str
) -> str:
    """
    Create HMAC signature for outgoing requests
    """
    payload = json.dumps(event_data, sort_keys=True, separators=(',', ':'))
    message = f"{timestamp}{payload}"
    
    signature = hmac.new(
        api_key.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"sha256={signature}"


def validate_epc_format(epc: str) -> bool:
    """
    Validate EPC format
    Basic validation for common EPC formats
    """
    if not epc or len(epc) < 8:
        return False
    
    # Check if it's a valid hex string
    try:
        int(epc, 16)
        return True
    except ValueError:
        return False


def sanitize_device_id(device_id: str) -> str:
    """
    Sanitize device ID for security
    """
    # Remove any potentially dangerous characters
    import re
    return re.sub(r'[^a-zA-Z0-9\-_]', '', device_id)


def get_current_timestamp() -> str:
    """
    Get current timestamp in ISO format
    """
    return datetime.now(timezone.utc).isoformat()


def parse_timestamp(timestamp_str: str) -> datetime:
    """
    Parse timestamp string to datetime object
    """
    # Handle various timestamp formats
    formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%f%z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(timestamp_str, fmt)
        except ValueError:
            continue
    
    # If all formats fail, try ISO format
    try:
        return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
    except ValueError:
        raise ValueError(f"Unable to parse timestamp: {timestamp_str}")


def calculate_rssi_quality(rssi: float) -> str:
    """
    Calculate RSSI quality indicator
    """
    if rssi >= -30:
        return "excellent"
    elif rssi >= -50:
        return "good"
    elif rssi >= -70:
        return "fair"
    else:
        return "poor"


def format_bytes(bytes_value: int) -> str:
    """
    Format bytes to human readable format
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.1f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.1f} PB"
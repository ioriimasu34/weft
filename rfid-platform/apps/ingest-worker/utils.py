"""
RFID Platform - Ingest Worker Utilities
"""

import hashlib
from datetime import datetime
from typing import Any, Dict


def generate_idempotency_key(org_id: str, epc: str, reader_id: str, antenna: int, read_at: datetime) -> str:
    """Generate idempotency key for RFID reads"""
    rounded_timestamp = int(read_at.timestamp())
    hash_input = f"{org_id}{epc}{reader_id}{antenna}{rounded_timestamp}"
    return hashlib.sha1(hash_input.encode('utf-8')).hexdigest()


def validate_epc_format(epc: str) -> bool:
    """Validate EPC format"""
    if not epc or len(epc) < 8:
        return False
    
    try:
        int(epc, 16)
        return True
    except ValueError:
        return False

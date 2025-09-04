#!/usr/bin/env python3
"""
RFID Platform - Ingest Worker Test Script
Tests the worker functionality without requiring full infrastructure
"""

import asyncio
import json
import sys
import os
from datetime import datetime, timezone
from typing import Dict, Any

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import CloudEvent, RFIDRead
from utils import generate_idempotency_key, validate_epc_format
from config import Settings

def test_epc_validation():
    """Test EPC format validation"""
    print("🧪 Testing EPC validation...")
    
    # Valid EPCs
    valid_epcs = [
        "E2000012345678901234",
        "30000000000000000001",
        "E28011606000020400000001",
        "1234567890ABCDEF"
    ]
    
    # Invalid EPCs
    invalid_epcs = [
        "",
        "123",  # Too short
        "INVALID_EPC",
        "1234567890GHIJKL",  # Invalid hex
        None
    ]
    
    for epc in valid_epcs:
        result = validate_epc_format(epc)
        print(f"  ✅ {epc}: {result}")
        assert result, f"EPC {epc} should be valid"
    
    for epc in invalid_epcs:
        if epc is not None:
            result = validate_epc_format(epc)
            print(f"  ❌ {epc}: {result}")
            assert not result, f"EPC {epc} should be invalid"
    
    print("✅ EPC validation tests passed!")

def test_idempotency_key_generation():
    """Test idempotency key generation"""
    print("🧪 Testing idempotency key generation...")
    
    org_id = "test-org"
    epc = "E2000012345678901234"
    reader_id = "reader-001"
    antenna = 1
    read_at = datetime.now(timezone.utc)
    
    # Generate key
    key1 = generate_idempotency_key(org_id, epc, reader_id, antenna, read_at)
    key2 = generate_idempotency_key(org_id, epc, reader_id, antenna, read_at)
    
    print(f"  Key 1: {key1}")
    print(f"  Key 2: {key2}")
    
    # Keys should be identical for same inputs
    assert key1 == key2, "Idempotency keys should be identical for same inputs"
    
    # Test with different timestamp
    read_at2 = datetime.now(timezone.utc)
    key3 = generate_idempotency_key(org_id, epc, reader_id, antenna, read_at2)
    
    print(f"  Key 3 (different time): {key3}")
    assert key1 != key3, "Idempotency keys should be different for different timestamps"
    
    print("✅ Idempotency key generation tests passed!")

def test_cloud_event_creation():
    """Test CloudEvent creation and validation"""
    print("🧪 Testing CloudEvent creation...")
    
    # Create test data
    test_data = {
        "org_id": "test-org",
        "epc": "E2000012345678901234",
        "reader_id": "reader-001",
        "antenna": 1,
        "rssi": -65.5,
        "read_at": datetime.now(timezone.utc).isoformat(),
        "reader_ts": datetime.now(timezone.utc).isoformat()
    }
    
    # Create CloudEvent
    event = CloudEvent(
        id="test-event-001",
        source="test-reader",
        type="com.rfid.read",
        time=datetime.now(timezone.utc),
        data=test_data
    )
    
    print(f"  Event ID: {event.id}")
    print(f"  Event Type: {event.type}")
    print(f"  Event Source: {event.source}")
    print(f"  Event Data: {json.dumps(event.data, indent=2)}")
    
    # Validate event structure
    assert event.id == "test-event-001"
    assert event.type == "com.rfid.read"
    assert event.source == "test-reader"
    assert event.data is not None
    assert event.data["epc"] == "E2000012345678901234"
    
    print("✅ CloudEvent creation tests passed!")

def test_rfid_read_model():
    """Test RFIDRead model validation"""
    print("🧪 Testing RFIDRead model...")
    
    # Create valid RFID read
    read = RFIDRead(
        org_id="test-org",
        epc="E2000012345678901234",
        reader_id="reader-001",
        antenna=1,
        rssi=-65.5,
        read_at=datetime.now(timezone.utc)
    )
    
    print(f"  EPC: {read.epc}")
    print(f"  Reader ID: {read.reader_id}")
    print(f"  Antenna: {read.antenna}")
    print(f"  RSSI: {read.rssi} dBm")
    print(f"  Read At: {read.read_at}")
    
    # Validate model
    assert read.org_id == "test-org"
    assert read.epc == "E2000012345678901234"
    assert read.reader_id == "reader-001"
    assert read.antenna == 1
    assert read.rssi == -65.5
    assert isinstance(read.read_at, datetime)
    
    print("✅ RFIDRead model tests passed!")

def test_settings_configuration():
    """Test settings configuration"""
    print("🧪 Testing settings configuration...")
    
    # Test with default values
    settings = Settings(
        supabase_url="https://test.supabase.co",
        supabase_service_key="test-service-key"
    )
    
    print(f"  Environment: {settings.environment}")
    print(f"  Worker ID: {settings.worker_id}")
    print(f"  Redis URL: {settings.redis_url}")
    print(f"  Supabase URL: {settings.supabase_url}")
    print(f"  Telemetry Enabled: {settings.telemetry_enabled}")
    
    # Validate settings
    assert settings.environment == "development"
    assert settings.worker_id == "worker-1"
    assert settings.redis_url == "redis://localhost:6379"
    assert settings.supabase_url == "https://test.supabase.co"
    assert settings.telemetry_enabled == True
    
    print("✅ Settings configuration tests passed!")

def test_data_processing_simulation():
    """Simulate data processing without external dependencies"""
    print("🧪 Testing data processing simulation...")
    
    # Simulate multiple RFID reads
    reads = []
    for i in range(5):
        read = RFIDRead(
            org_id="test-org",
            epc=f"E200001234567890{i:04d}",
            reader_id=f"reader-{i % 3 + 1:03d}",
            antenna=(i % 4) + 1,
            rssi=-60 - (i * 2),
            read_at=datetime.now(timezone.utc)
        )
        reads.append(read)
    
    print(f"  Generated {len(reads)} RFID reads")
    
    # Process each read
    for i, read in enumerate(reads):
        # Generate idempotency key
        idem_key = generate_idempotency_key(
            read.org_id, read.epc, read.reader_id, read.antenna, read.read_at
        )
        
        # Validate EPC
        epc_valid = validate_epc_format(read.epc)
        
        print(f"  Read {i+1}: EPC={read.epc}, Valid={epc_valid}, Key={idem_key[:8]}...")
        
        assert epc_valid, f"EPC {read.epc} should be valid"
        assert len(idem_key) == 40, "Idempotency key should be 40 characters (SHA1)"
    
    # Calculate statistics
    unique_epcs = len(set(read.epc for read in reads))
    unique_readers = len(set(read.reader_id for read in reads))
    avg_rssi = sum(read.rssi for read in reads) / len(reads)
    
    print(f"  Statistics:")
    print(f"    Total reads: {len(reads)}")
    print(f"    Unique EPCs: {unique_epcs}")
    print(f"    Unique readers: {unique_readers}")
    print(f"    Average RSSI: {avg_rssi:.1f} dBm")
    
    print("✅ Data processing simulation tests passed!")

def main():
    """Run all tests"""
    print("🚀 Starting RFID Ingest Worker Tests")
    print("=" * 50)
    
    try:
        test_epc_validation()
        print()
        
        test_idempotency_key_generation()
        print()
        
        test_cloud_event_creation()
        print()
        
        test_rfid_read_model()
        print()
        
        test_settings_configuration()
        print()
        
        test_data_processing_simulation()
        print()
        
        print("🎉 All tests passed successfully!")
        print("✅ Ingest Worker is functioning correctly")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

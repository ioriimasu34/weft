-- Add missing upsert_rfid_read function
CREATE OR REPLACE FUNCTION upsert_rfid_read(
    p_org_id TEXT,
    p_epc TEXT,
    p_reader_id UUID,
    p_antenna INTEGER,
    p_rssi DECIMAL(5,2),
    p_read_at TIMESTAMPTZ,
    p_idem_key TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Insert or update the read record
    INSERT INTO reads_parent (
        org_id, epc, reader_id, antenna, rssi, read_at, idem_key
    ) VALUES (
        p_org_id, p_epc, p_reader_id, p_antenna, p_rssi, p_read_at, p_idem_key
    )
    ON CONFLICT (idem_key) DO UPDATE SET
        rssi = EXCLUDED.rssi,
        read_at = EXCLUDED.read_at
    RETURNING to_jsonb(reads_parent.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

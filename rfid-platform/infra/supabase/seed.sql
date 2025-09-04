-- RFID Platform - Seed Data
-- Sample data for development and testing

-- Insert sample organization
INSERT INTO orgs (id, name, slug, settings) VALUES 
('ktl', 'Kattali Textile Ltd.', 'ktl', '{"timezone": "Asia/Dhaka", "currency": "BDT", "features": {"rtls": true, "analytics": true}}');

-- Insert sample admin user
INSERT INTO users (id, email, full_name, avatar_url) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@ktl.com', 'Admin User', 'https://avatar.vercel.sh/admin@ktl.com');

-- Insert admin membership
INSERT INTO memberships (org_id, user_id, role) VALUES 
('ktl', '550e8400-e29b-41d4-a716-446655440000', 'owner');

-- Insert sample locations (hierarchical structure)
INSERT INTO locations (id, org_id, parent_id, name, path, level, metadata) VALUES 
-- Factory level
('11111111-1111-1111-1111-111111111111', 'ktl', NULL, 'KTL Factory', 'ktl-factory', 0, '{"type": "factory", "address": "Dhaka, Bangladesh"}'),

-- Production lines
('22222222-2222-2222-2222-222222222222', 'ktl', '11111111-1111-1111-1111-111111111111', 'Production Line 1', 'ktl-factory/line-1', 1, '{"type": "production_line", "capacity": 150}'),
('33333333-3333-3333-3333-333333333333', 'ktl', '11111111-1111-1111-1111-111111111111', 'Production Line 2', 'ktl-factory/line-2', 1, '{"type": "production_line", "capacity": 150}'),
('44444444-4444-4444-4444-444444444444', 'ktl', '11111111-1111-1111-1111-111111111111', 'Production Line 3', 'ktl-factory/line-3', 1, '{"type": "production_line", "capacity": 150}'),

-- Checkpoints
('55555555-5555-5555-5555-555555555555', 'ktl', '22222222-2222-2222-2222-222222222222', 'Cut Station', 'ktl-factory/line-1/cut', 2, '{"type": "checkpoint", "process": "cutting"}'),
('66666666-6666-6666-6666-666666666666', 'ktl', '22222222-2222-2222-2222-222222222222', 'Sew Station', 'ktl-factory/line-1/sew', 2, '{"type": "checkpoint", "process": "sewing"}'),
('77777777-7777-7777-7777-777777777777', 'ktl', '22222222-2222-2222-2222-222222222222', 'Finish Station', 'ktl-factory/line-1/finish', 2, '{"type": "checkpoint", "process": "finishing"}'),

('88888888-8888-8888-8888-888888888888', 'ktl', '33333333-3333-3333-3333-333333333333', 'Cut Station', 'ktl-factory/line-2/cut', 2, '{"type": "checkpoint", "process": "cutting"}'),
('99999999-9999-9999-9999-999999999999', 'ktl', '33333333-3333-3333-3333-333333333333', 'Sew Station', 'ktl-factory/line-2/sew', 2, '{"type": "checkpoint", "process": "sewing"}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ktl', '33333333-3333-3333-3333-333333333333', 'Finish Station', 'ktl-factory/line-2/finish', 2, '{"type": "checkpoint", "process": "finishing"}'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ktl', '44444444-4444-4444-4444-444444444444', 'Cut Station', 'ktl-factory/line-3/cut', 2, '{"type": "checkpoint", "process": "cutting"}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ktl', '44444444-4444-4444-4444-444444444444', 'Sew Station', 'ktl-factory/line-3/sew', 2, '{"type": "checkpoint", "process": "sewing"}'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'ktl', '44444444-4444-4444-4444-444444444444', 'Finish Station', 'ktl-factory/line-3/finish', 2, '{"type": "checkpoint", "process": "finishing"}'),

-- Uniform management areas
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'ktl', '11111111-1111-1111-1111-111111111111', 'Uniform Storage', 'ktl-factory/uniform-storage', 1, '{"type": "storage", "purpose": "uniforms"}'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ktl', '11111111-1111-1111-1111-111111111111', 'Laundry Area', 'ktl-factory/laundry', 1, '{"type": "processing", "purpose": "laundry"}');

-- Insert sample RFID readers
INSERT INTO readers (id, org_id, location_id, name, device_id, api_key_hash, status, last_seen_at, metadata) VALUES 
-- Fixed readers at checkpoints
('r1111111-1111-1111-1111-111111111111', 'ktl', '55555555-5555-5555-5555-555555555555', 'Line 1 Cut Reader', 'impinj-r700-001', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '2 minutes', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),
('r2222222-2222-2222-2222-222222222222', 'ktl', '66666666-6666-6666-6666-666666666666', 'Line 1 Sew Reader', 'impinj-r700-002', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '1 minute', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),
('r3333333-3333-3333-3333-333333333333', 'ktl', '77777777-7777-7777-7777-777777777777', 'Line 1 Finish Reader', 'impinj-r700-003', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '30 seconds', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),

('r4444444-4444-4444-4444-444444444444', 'ktl', '88888888-8888-8888-8888-888888888888', 'Line 2 Cut Reader', 'impinj-r700-004', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '45 seconds', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),
('r5555555-5555-5555-5555-555555555555', 'ktl', '99999999-9999-9999-9999-999999999999', 'Line 2 Sew Reader', 'impinj-r700-005', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '1 minute', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),
('r6666666-6666-6666-6666-666666666666', 'ktl', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Line 2 Finish Reader', 'impinj-r700-006', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '2 minutes', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),

('r7777777-7777-7777-7777-777777777777', 'ktl', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Line 3 Cut Reader', 'impinj-r700-007', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'offline', NOW() - INTERVAL '1 hour', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),
('r8888888-8888-8888-8888-888888888888', 'ktl', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Line 3 Sew Reader', 'impinj-r700-008', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'maintenance', NOW() - INTERVAL '30 minutes', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),
('r9999999-9999-9999-9999-999999999999', 'ktl', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Line 3 Finish Reader', 'impinj-r700-009', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '15 seconds', '{"type": "fixed", "model": "Impinj R700", "antenna_count": 4}'),

-- Handheld readers
('raaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ktl', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Uniform Handheld 1', 'zebra-mc3300-001', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '5 minutes', '{"type": "handheld", "model": "Zebra MC3300", "battery": 85}'),
('rbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ktl', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Laundry Handheld 1', 'zebra-mc3300-002', '$argon2id$v=19$m=65536,t=3,p=4$salt123456789012345678901234567890$hash123456789012345678901234567890', 'online', NOW() - INTERVAL '3 minutes', '{"type": "handheld", "model": "Zebra MC3300", "battery": 92}');

-- Insert sample assets (RFID tags)
INSERT INTO assets (id, org_id, epc, sku, name, kind, status, metadata) VALUES 
-- Production garments
('a1111111-1111-1111-1111-111111111111', 'ktl', '3034A1B2C3D4E5F6', 'SHIRT-001', 'Cotton T-Shirt', 'garment', 'active', '{"color": "blue", "size": "M", "material": "cotton"}'),
('a2222222-2222-2222-2222-222222222222', 'ktl', '3034A1B2C3D4E5F7', 'SHIRT-002', 'Cotton T-Shirt', 'garment', 'active', '{"color": "red", "size": "L", "material": "cotton"}'),
('a3333333-3333-3333-3333-333333333333', 'ktl', '3034A1B2C3D4E5F8', 'PANTS-001', 'Denim Jeans', 'garment', 'active', '{"color": "blue", "size": "32", "material": "denim"}'),
('a4444444-4444-4444-4444-444444444444', 'ktl', '3034A1B2C3D4E5F9', 'PANTS-002', 'Denim Jeans', 'garment', 'active', '{"color": "black", "size": "34", "material": "denim"}'),
('a5555555-5555-5555-5555-555555555555', 'ktl', '3034A1B2C3D4E5FA', 'DRESS-001', 'Summer Dress', 'garment', 'active', '{"color": "yellow", "size": "S", "material": "cotton"}'),

-- Uniforms
('a6666666-6666-6666-6666-666666666666', 'ktl', '3034A1B2C3D4E5FB', 'UNIFORM-001', 'Factory Uniform', 'uniform', 'active', '{"employee_id": "EMP001", "department": "production", "size": "M"}'),
('a7777777-7777-7777-7777-777777777777', 'ktl', '3034A1B2C3D4E5FC', 'UNIFORM-002', 'Factory Uniform', 'uniform', 'active', '{"employee_id": "EMP002", "department": "production", "size": "L"}'),
('a8888888-8888-8888-8888-888888888888', 'ktl', '3034A1B2C3D4E5FD', 'UNIFORM-003', 'Factory Uniform', 'uniform', 'active', '{"employee_id": "EMP003", "department": "quality", "size": "S"}'),
('a9999999-9999-9999-9999-999999999999', 'ktl', '3034A1B2C3D4E5FE', 'UNIFORM-004', 'Factory Uniform', 'uniform', 'active', '{"employee_id": "EMP004", "department": "maintenance", "size": "XL"}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ktl', '3034A1B2C3D4E5FF', 'UNIFORM-005', 'Factory Uniform', 'uniform', 'active', '{"employee_id": "EMP005", "department": "production", "size": "M"}'),

-- Bundles
('abbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ktl', '3034A1B2C3D4E600', 'BUNDLE-001', 'Production Bundle', 'bundle', 'active', '{"batch_id": "BATCH001", "quantity": 50, "product_type": "shirts"}'),
('accccccc-cccc-cccc-cccc-cccccccccccc', 'ktl', '3034A1B2C3D4E601', 'BUNDLE-002', 'Production Bundle', 'bundle', 'active', '{"batch_id": "BATCH002", "quantity": 30, "product_type": "pants"}'),
('addddddd-dddd-dddd-dddd-dddddddddddd', 'ktl', '3034A1B2C3D4E602', 'BUNDLE-003', 'Production Bundle', 'bundle', 'active', '{"batch_id": "BATCH003", "quantity": 25, "product_type": "dresses"}');

-- Insert sample events
INSERT INTO events (org_id, type, payload) VALUES 
('ktl', 'system.initialized', '{"message": "RFID Platform initialized", "version": "1.0.0"}'),
('ktl', 'reader.registered', '{"reader_id": "r1111111-1111-1111-1111-111111111111", "name": "Line 1 Cut Reader", "status": "online"}'),
('ktl', 'asset.registered', '{"asset_id": "a1111111-1111-1111-1111-111111111111", "epc": "3034A1B2C3D4E5F6", "name": "Cotton T-Shirt"}');

-- Create some sample reads for the last 24 hours
DO $$
DECLARE
    reader_ids UUID[] := ARRAY[
        'r1111111-1111-1111-1111-111111111111',
        'r2222222-2222-2222-2222-222222222222',
        'r3333333-3333-3333-3333-333333333333',
        'r4444444-4444-4444-4444-444444444444',
        'r5555555-5555-5555-5555-555555555555',
        'r6666666-6666-6666-6666-666666666666',
        'r9999999-9999-9999-9999-999999999999'
    ];
    asset_epcs TEXT[] := ARRAY[
        '3034A1B2C3D4E5F6',
        '3034A1B2C3D4E5F7',
        '3034A1B2C3D4E5F8',
        '3034A1B2C3D4E5F9',
        '3034A1B2C3D4E5FA',
        '3034A1B2C3D4E5FB',
        '3034A1B2C3D4E5FC',
        '3034A1B2C3D4E5FD',
        '3034A1B2C3D4E5FE',
        '3034A1B2C3D4E5FF',
        '3034A1B2C3D4E600',
        '3034A1B2C3D4E601',
        '3034A1B2C3D4E602'
    ];
    i INTEGER;
    j INTEGER;
    read_time TIMESTAMPTZ;
    reader_id UUID;
    epc TEXT;
    antenna INTEGER;
    rssi DECIMAL(5,2);
    idem_key TEXT;
BEGIN
    -- Generate reads for the last 24 hours
    FOR i IN 1..1000 LOOP
        -- Random time in the last 24 hours
        read_time := NOW() - (random() * INTERVAL '24 hours');
        
        -- Random reader and asset
        reader_id := reader_ids[1 + floor(random() * array_length(reader_ids, 1))];
        epc := asset_epcs[1 + floor(random() * array_length(asset_epcs, 1))];
        
        -- Random antenna (1-4) and RSSI (-30 to -80)
        antenna := 1 + floor(random() * 4);
        rssi := -30 - (random() * 50);
        
        -- Generate idempotency key
        idem_key := encode(digest('ktl' || epc || reader_id || antenna || floor(extract(epoch from read_time) * 1000)::text, 'sha1'), 'hex');
        
        -- Insert read
        INSERT INTO reads_parent (org_id, epc, reader_id, antenna, rssi, read_at, idem_key)
        VALUES ('ktl', epc, reader_id, antenna, rssi, read_time, idem_key)
        ON CONFLICT (idem_key) DO NOTHING;
    END LOOP;
END $$;
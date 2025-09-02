-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'hr', 'supervisor', 'operator');
CREATE TYPE tag_status AS ENUM ('active', 'inactive', 'lost', 'damaged');
CREATE TYPE scan_type AS ENUM ('entry', 'exit', 'checkpoint', 'issue', 'return');

-- Factories table (multi-tenant isolation)
CREATE TABLE factories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    country VARCHAR(100) DEFAULT 'Bangladesh',
    timezone VARCHAR(50) DEFAULT 'Asia/Dhaka',
    max_lines INTEGER DEFAULT 10,
    max_tags_per_line INTEGER DEFAULT 150,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'operator',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RFID Tags table
CREATE TABLE rfid_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    tag_epc VARCHAR(96) UNIQUE NOT NULL, -- EPC-96 format
    tag_type VARCHAR(50) NOT NULL, -- 'garment', 'bundle', 'uniform'
    status tag_status DEFAULT 'active',
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    issued_at TIMESTAMP WITH TIME ZONE,
    expected_return_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Lines table
CREATE TABLE production_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    line_number INTEGER NOT NULL,
    max_capacity INTEGER DEFAULT 150,
    current_capacity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(factory_id, line_number)
);

-- Checkpoints table (RFID reader locations)
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    checkpoint_type scan_type NOT NULL,
    line_id UUID REFERENCES production_lines(id),
    reader_ip VARCHAR(45), -- IPv4/IPv6
    reader_port INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scan Events table (main RFID data)
CREATE TABLE scan_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES rfid_tags(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES checkpoints(id) ON DELETE CASCADE,
    scan_type scan_type NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    reader_timestamp TIMESTAMP WITH TIME ZONE,
    signal_strength INTEGER, -- RSSI value
    antenna_number INTEGER,
    read_count INTEGER DEFAULT 1,
    raw_data JSONB, -- Store raw reader data
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Production Tracking table
CREATE TABLE production_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES rfid_tags(id) ON DELETE CASCADE,
    line_id UUID NOT NULL REFERENCES production_lines(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL, -- 'cut', 'issue', 'station', 'finish'
    operator_id UUID REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Uniform Management table
CREATE TABLE uniform_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES rfid_tags(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uniform_type VARCHAR(100) NOT NULL, -- 'shirt', 'pants', 'overall'
    size VARCHAR(20),
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_return_at TIMESTAMP WITH TIME ZONE,
    returned_at TIMESTAMP WITH TIME ZONE,
    condition_issued VARCHAR(50) DEFAULT 'new',
    condition_returned VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_factory_id ON users(factory_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_rfid_tags_factory_id ON rfid_tags(factory_id);
CREATE INDEX idx_rfid_tags_epc ON rfid_tags(tag_epc);
CREATE INDEX idx_scan_events_factory_id ON scan_events(factory_id);
CREATE INDEX idx_scan_events_timestamp ON scan_events(timestamp);
CREATE INDEX idx_scan_events_tag_id ON scan_events(tag_id);
CREATE INDEX idx_scan_events_checkpoint_id ON scan_events(checkpoint_id);
CREATE INDEX idx_production_tracking_factory_id ON production_tracking(factory_id);
CREATE INDEX idx_production_tracking_line_id ON production_tracking(line_id);
CREATE INDEX idx_uniform_management_factory_id ON uniform_management(factory_id);
CREATE INDEX idx_uniform_management_employee_id ON uniform_management(employee_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_factories_updated_at BEFORE UPDATE ON factories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rfid_tags_updated_at BEFORE UPDATE ON rfid_tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_lines_updated_at BEFORE UPDATE ON production_lines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkpoints_updated_at BEFORE UPDATE ON checkpoints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_tracking_updated_at BEFORE UPDATE ON production_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_uniform_management_updated_at BEFORE UPDATE ON uniform_management FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for Kattali Textile Ltd.
INSERT INTO factories (id, name, code, address, country, timezone, max_lines, max_tags_per_line) VALUES
    (uuid_generate_v4(), 'Kattali Textile Ltd.', 'KTL', 'Dhaka, Bangladesh', 'Bangladesh', 'Asia/Dhaka', 3, 150);

-- Get the factory ID for foreign key references
DO $$
DECLARE
    factory_id UUID;
BEGIN
    SELECT id INTO factory_id FROM factories WHERE code = 'KTL';
    
    -- Insert sample production lines
    INSERT INTO production_lines (factory_id, name, line_number, max_capacity) VALUES
        (factory_id, 'Line A', 1, 150),
        (factory_id, 'Line B', 2, 150),
        (factory_id, 'Line C', 3, 150);
    
    -- Insert sample checkpoints
    INSERT INTO checkpoints (factory_id, name, location, checkpoint_type, line_id) VALUES
        (factory_id, 'Cut Entry', 'Cutting Section', 'entry', (SELECT id FROM production_lines WHERE line_number = 1)),
        (factory_id, 'Issue Point', 'Issue Station', 'issue', (SELECT id FROM production_lines WHERE line_number = 1)),
        (factory_id, 'Station 1', 'Sewing Station 1', 'checkpoint', (SELECT id FROM production_lines WHERE line_number = 1)),
        (factory_id, 'Station 2', 'Sewing Station 2', 'checkpoint', (SELECT id FROM production_lines WHERE line_number = 1)),
        (factory_id, 'Finish Exit', 'Finishing Section', 'exit', (SELECT id FROM production_lines WHERE line_number = 1));
END $$;
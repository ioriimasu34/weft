-- RFID Platform - Initial Schema with Partitioning and RLS
-- Multi-tenant SaaS with org-level isolation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE asset_status AS ENUM ('active', 'inactive', 'maintenance', 'retired');
CREATE TYPE reader_status AS ENUM ('online', 'offline', 'maintenance', 'error');

-- Organizations (tenants)
CREATE TABLE orgs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization memberships
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Locations (hierarchical tree structure)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL, -- Materialized path for efficient queries
    level INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFID Readers (device registry)
CREATE TABLE readers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    device_id TEXT NOT NULL, -- Unique device identifier
    api_key_hash TEXT NOT NULL, -- Argon2id hash of API key
    status reader_status DEFAULT 'offline',
    last_seen_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, device_id)
);

-- Assets (RFID tags)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    epc TEXT NOT NULL, -- Electronic Product Code
    sku TEXT,
    name TEXT,
    kind TEXT, -- 'garment', 'uniform', 'bundle', etc.
    status asset_status DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, epc)
);

-- Parent table for RFID reads (partitioned by date)
CREATE TABLE reads_parent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    epc TEXT NOT NULL,
    reader_id UUID NOT NULL REFERENCES readers(id) ON DELETE CASCADE,
    antenna INTEGER NOT NULL,
    rssi DECIMAL(5,2) NOT NULL,
    read_at TIMESTAMPTZ NOT NULL,
    idem_key TEXT NOT NULL, -- Idempotency key for deduplication
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(idem_key)
) PARTITION BY RANGE (read_at);

-- Events table for real-time notifications
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'rfid.read', 'reader.status', 'asset.status', etc.
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily partitions for reads (90-day retention)
CREATE OR REPLACE FUNCTION create_reads_partition(date)
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    start_date TIMESTAMPTZ;
    end_date TIMESTAMPTZ;
BEGIN
    partition_name := 'reads_' || to_char($1, 'YYYY_MM_DD');
    start_date := $1::date;
    end_date := ($1 + interval '1 day')::date;
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF reads_parent
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
    
    -- Create indexes on partition
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (org_id, epc)',
                   partition_name || '_org_epc_idx', partition_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (org_id, read_at DESC)',
                   partition_name || '_org_read_at_idx', partition_name);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (reader_id, read_at DESC)',
                   partition_name || '_reader_read_at_idx', partition_name);
END;
$$ LANGUAGE plpgsql;

-- Create partitions for the next 90 days
DO $$
DECLARE
    i INTEGER;
    current_date DATE := CURRENT_DATE;
BEGIN
    FOR i IN 0..89 LOOP
        PERFORM create_reads_partition(current_date + i);
    END LOOP;
END $$;

-- Partition rotation function (run daily)
CREATE OR REPLACE FUNCTION rotate_reads_partitions()
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    cutoff_date DATE := CURRENT_DATE - interval '90 days';
BEGIN
    -- Create new partition for today
    PERFORM create_reads_partition(CURRENT_DATE);
    
    -- Drop old partitions
    FOR partition_name IN 
        SELECT schemaname||'.'||tablename 
        FROM pg_tables 
        WHERE tablename LIKE 'reads_%' 
        AND tablename ~ '^reads_[0-9]{4}_[0-9]{2}_[0-9]{2}$'
        AND tablename < 'reads_' || to_char(cutoff_date, 'YYYY_MM_DD')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || partition_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_orgs_slug ON orgs(slug);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_memberships_org_user ON memberships(org_id, user_id);
CREATE INDEX idx_memberships_user_org ON memberships(user_id, org_id);
CREATE INDEX idx_locations_org_path ON locations(org_id, path);
CREATE INDEX idx_locations_parent ON locations(parent_id);
CREATE INDEX idx_readers_org_device ON readers(org_id, device_id);
CREATE INDEX idx_readers_org_status ON readers(org_id, status);
CREATE INDEX idx_assets_org_epc ON assets(org_id, epc);
CREATE INDEX idx_assets_org_status ON assets(org_id, status);
CREATE INDEX idx_events_org_created ON events(org_id, created_at DESC);
CREATE INDEX idx_events_org_type ON events(org_id, type);

-- Row Level Security (RLS) Policies
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE readers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reads_parent ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::json->>'org_id',
        current_setting('app.current_org_id', true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin or owner
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
    org_id_val TEXT;
BEGIN
    org_id_val := get_user_org_id();
    
    SELECT role INTO user_role_val
    FROM memberships m
    JOIN users u ON m.user_id = u.id
    WHERE m.org_id = org_id_val
    AND u.id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
    
    RETURN user_role_val IN ('admin', 'owner');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for orgs
CREATE POLICY "Users can view their orgs" ON orgs
    FOR SELECT USING (
        id IN (
            SELECT org_id FROM memberships m
            JOIN users u ON m.user_id = u.id
            WHERE u.id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    );

CREATE POLICY "Admins can update their orgs" ON orgs
    FOR UPDATE USING (is_admin_or_owner());

-- RLS Policies for users
CREATE POLICY "Users can view themselves" ON users
    FOR SELECT USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "Users can update themselves" ON users
    FOR UPDATE USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- RLS Policies for memberships
CREATE POLICY "Users can view org memberships" ON memberships
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM memberships m
            JOIN users u ON m.user_id = u.id
            WHERE u.id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
        )
    );

CREATE POLICY "Admins can manage memberships" ON memberships
    FOR ALL USING (is_admin_or_owner());

-- RLS Policies for locations
CREATE POLICY "Users can view org locations" ON locations
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage locations" ON locations
    FOR ALL USING (is_admin_or_owner());

-- RLS Policies for readers
CREATE POLICY "Users can view org readers" ON readers
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage readers" ON readers
    FOR ALL USING (is_admin_or_owner());

-- RLS Policies for assets
CREATE POLICY "Users can view org assets" ON assets
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage assets" ON assets
    FOR ALL USING (is_admin_or_owner());

-- RLS Policies for reads_parent
CREATE POLICY "Users can view org reads" ON reads_parent
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Workers can insert reads" ON reads_parent
    FOR INSERT WITH CHECK (true); -- Workers use service role

-- RLS Policies for events
CREATE POLICY "Users can view org events" ON events
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Workers can insert events" ON events
    FOR INSERT WITH CHECK (true); -- Workers use service role

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_readers_updated_at BEFORE UPDATE ON readers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO events (org_id, type, payload)
    VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        'audit.' || TG_OP || '.' || TG_TABLE_NAME,
        jsonb_build_object(
            'operation', TG_OP,
            'table', TG_TABLE_NAME,
            'old', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
            'new', CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
            'user_id', current_setting('request.jwt.claims', true)::json->>'sub',
            'timestamp', NOW()
        )
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_orgs_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orgs
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_memberships_trigger
    AFTER INSERT OR UPDATE OR DELETE ON memberships
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_readers_trigger
    AFTER INSERT OR UPDATE OR DELETE ON readers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Views for common queries
CREATE VIEW reader_status_summary AS
SELECT 
    r.org_id,
    r.id as reader_id,
    r.name,
    r.status,
    r.last_seen_at,
    l.name as location_name,
    l.path as location_path,
    CASE 
        WHEN r.last_seen_at > NOW() - INTERVAL '5 minutes' THEN 'online'
        WHEN r.last_seen_at > NOW() - INTERVAL '1 hour' THEN 'warning'
        ELSE 'offline'
    END as health_status
FROM readers r
LEFT JOIN locations l ON r.location_id = l.id;

CREATE VIEW asset_summary AS
SELECT 
    a.org_id,
    a.id as asset_id,
    a.epc,
    a.sku,
    a.name,
    a.kind,
    a.status,
    COUNT(r.id) as total_reads,
    MAX(r.read_at) as last_seen_at,
    COUNT(DISTINCT r.reader_id) as readers_seen
FROM assets a
LEFT JOIN reads_parent r ON a.org_id = r.org_id AND a.epc = r.epc
WHERE r.read_at > NOW() - INTERVAL '24 hours'
GROUP BY a.org_id, a.id, a.epc, a.sku, a.name, a.kind, a.status;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Service role permissions (for workers)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
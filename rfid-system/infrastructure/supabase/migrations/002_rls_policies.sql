-- Enable Row Level Security on all tables
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfid_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniform_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a function to get current user's factory_id
CREATE OR REPLACE FUNCTION get_user_factory_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT factory_id 
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'::user_role
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is hr or admin
CREATE OR REPLACE FUNCTION is_hr_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('hr', 'admin')::user_role
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is supervisor or higher
CREATE OR REPLACE FUNCTION is_supervisor_or_higher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('supervisor', 'hr', 'admin')::user_role
        FROM users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Factories policies
CREATE POLICY "Users can view their own factory" ON factories
    FOR SELECT USING (id = get_user_factory_id());

CREATE POLICY "Only admins can create factories" ON factories
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update their factory" ON factories
    FOR UPDATE USING (id = get_user_factory_id() AND is_admin());

CREATE POLICY "Only admins can delete their factory" ON factories
    FOR DELETE USING (id = get_user_factory_id() AND is_admin());

-- Users policies
CREATE POLICY "Users can view users in their factory" ON users
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "HR and admins can create users in their factory" ON users
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id() AND is_hr_or_admin());

CREATE POLICY "HR and admins can update users in their factory" ON users
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_hr_or_admin());

CREATE POLICY "HR and admins can delete users in their factory" ON users
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_hr_or_admin());

-- RFID Tags policies
CREATE POLICY "Users can view tags in their factory" ON rfid_tags
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "Supervisors and higher can create tags in their factory" ON rfid_tags
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can update tags in their factory" ON rfid_tags
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can delete tags in their factory" ON rfid_tags
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

-- Production Lines policies
CREATE POLICY "Users can view production lines in their factory" ON production_lines
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "Supervisors and higher can create production lines in their factory" ON production_lines
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can update production lines in their factory" ON production_lines
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can delete production lines in their factory" ON production_lines
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

-- Checkpoints policies
CREATE POLICY "Users can view checkpoints in their factory" ON checkpoints
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "Supervisors and higher can create checkpoints in their factory" ON checkpoints
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can update checkpoints in their factory" ON checkpoints
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can delete checkpoints in their factory" ON checkpoints
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

-- Scan Events policies
CREATE POLICY "Users can view scan events in their factory" ON scan_events
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "System can create scan events in user's factory" ON scan_events
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id());

CREATE POLICY "Only admins can update scan events in their factory" ON scan_events
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_admin());

CREATE POLICY "Only admins can delete scan events in their factory" ON scan_events
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_admin());

-- Production Tracking policies
CREATE POLICY "Users can view production tracking in their factory" ON production_tracking
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "Supervisors and higher can create production tracking in their factory" ON production_tracking
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can update production tracking in their factory" ON production_tracking
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

CREATE POLICY "Supervisors and higher can delete production tracking in their factory" ON production_tracking
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_supervisor_or_higher());

-- Uniform Management policies
CREATE POLICY "Users can view uniform management in their factory" ON uniform_management
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "HR and higher can create uniform management in their factory" ON uniform_management
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id() AND is_hr_or_admin());

CREATE POLICY "HR and higher can update uniform management in their factory" ON uniform_management
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_hr_or_admin());

CREATE POLICY "HR and higher can delete uniform management in their factory" ON uniform_management
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_hr_or_admin());

-- Audit Logs policies
CREATE POLICY "Users can view audit logs in their factory" ON audit_logs
    FOR SELECT USING (factory_id = get_user_factory_id());

CREATE POLICY "System can create audit logs in user's factory" ON audit_logs
    FOR INSERT WITH CHECK (factory_id = get_user_factory_id());

CREATE POLICY "Only admins can update audit logs in their factory" ON audit_logs
    FOR UPDATE USING (factory_id = get_user_factory_id() AND is_admin());

CREATE POLICY "Only admins can delete audit logs in their factory" ON audit_logs
    FOR DELETE USING (factory_id = get_user_factory_id() AND is_admin());

-- Create function to automatically log audit events
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    user_id UUID;
    factory_id UUID;
BEGIN
    -- Get current user ID and factory ID
    user_id := auth.uid();
    
    IF user_id IS NOT NULL THEN
        SELECT factory_id INTO factory_id FROM users WHERE id = user_id;
    END IF;
    
    -- Prepare old and new data
    IF TG_OP = 'DELETE' THEN
        old_data = to_jsonb(OLD);
        new_data = NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data = NULL;
        new_data = to_jsonb(NEW);
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        factory_id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        COALESCE(factory_id, (new_data->>'factory_id')::UUID, (old_data->>'factory_id')::UUID),
        user_id,
        TG_OP,
        TG_TABLE_NAME,
        COALESCE((new_data->>'id')::UUID, (old_data->>'id')::UUID),
        old_data,
        new_data,
        inet_client_addr()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for all tables
CREATE TRIGGER audit_factories_trigger AFTER INSERT OR UPDATE OR DELETE ON factories FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_users_trigger AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_rfid_tags_trigger AFTER INSERT OR UPDATE OR DELETE ON rfid_tags FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_production_lines_trigger AFTER INSERT OR UPDATE OR DELETE ON production_lines FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_checkpoints_trigger AFTER INSERT OR UPDATE OR DELETE ON checkpoints FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_scan_events_trigger AFTER INSERT OR UPDATE OR DELETE ON scan_events FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_production_tracking_trigger AFTER INSERT OR UPDATE OR DELETE ON production_tracking FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_uniform_management_trigger AFTER INSERT OR UPDATE OR DELETE ON uniform_management FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create views for common queries
CREATE VIEW factory_dashboard AS
SELECT 
    f.id as factory_id,
    f.name as factory_name,
    f.code as factory_code,
    COUNT(DISTINCT u.id) as total_employees,
    COUNT(DISTINCT rt.id) as total_tags,
    COUNT(DISTINCT pl.id) as total_lines,
    COUNT(DISTINCT c.id) as total_checkpoints,
    COUNT(se.id) as total_scans_today
FROM factories f
LEFT JOIN users u ON f.id = u.factory_id AND u.is_active = true
LEFT JOIN rfid_tags rt ON f.id = rt.factory_id AND rt.status = 'active'
LEFT JOIN production_lines pl ON f.id = pl.factory_id AND pl.is_active = true
LEFT JOIN checkpoints c ON f.id = c.factory_id AND c.is_active = true
LEFT JOIN scan_events se ON f.id = se.factory_id AND se.timestamp >= CURRENT_DATE
GROUP BY f.id, f.name, f.code;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance on RLS
CREATE INDEX CONCURRENTLY idx_scan_events_factory_timestamp ON scan_events(factory_id, timestamp DESC);
CREATE INDEX CONCURRENTLY idx_users_factory_role ON users(factory_id, role);
CREATE INDEX CONCURRENTLY idx_rfid_tags_factory_status ON rfid_tags(factory_id, status);
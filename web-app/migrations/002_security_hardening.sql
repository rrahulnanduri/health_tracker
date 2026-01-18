-- Migration: Security hardening for auth_users table
-- Run this against your PostgreSQL database

-- Add role constraint to prevent invalid roles
ALTER TABLE auth_users 
DROP CONSTRAINT IF EXISTS valid_role;

ALTER TABLE auth_users 
ADD CONSTRAINT valid_role 
CHECK (role IN ('patient', 'superuser'));

-- Add audit logging table for security-sensitive changes
CREATE TABLE IF NOT EXISTS auth_audit (
    id SERIAL PRIMARY KEY,
    auth_user_id INTEGER REFERENCES auth_users(id),
    action VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by VARCHAR(255),
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_auth_audit_user ON auth_audit(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit(created_at);

-- Create trigger function to log role changes
CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role OR OLD.user_id IS DISTINCT FROM NEW.user_id THEN
        INSERT INTO auth_audit (auth_user_id, action, old_value, new_value)
        VALUES (
            NEW.id,
            'ROLE_OR_USER_CHANGE',
            jsonb_build_object('role', OLD.role, 'user_id', OLD.user_id),
            jsonb_build_object('role', NEW.role, 'user_id', NEW.user_id)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS auth_users_audit_trigger ON auth_users;
CREATE TRIGGER auth_users_audit_trigger
    AFTER UPDATE ON auth_users
    FOR EACH ROW
    EXECUTE FUNCTION log_role_change();

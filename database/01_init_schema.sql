-- Initialize the health_db schema
-- This script runs automatically on first container startup

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    gender VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lab_metrics table
CREATE TABLE IF NOT EXISTS lab_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(255),
    test_date DATE,
    test_name VARCHAR(255),
    test_value VARCHAR(255),
    test_unit VARCHAR(100),
    test_range VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint to prevent duplicates
-- Only one result per user per test per date
ALTER TABLE lab_metrics 
ADD CONSTRAINT unique_metric_entry 
UNIQUE (user_id, test_date, test_name);

-- Insert default user if not exists
INSERT INTO users (id, name, age, gender) 
VALUES (1, 'DEFAULT USER', 0, 'UNKNOWN')
ON CONFLICT (id) DO NOTHING;

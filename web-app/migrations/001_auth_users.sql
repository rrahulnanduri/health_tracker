-- Migration: Create authentication tables
-- Run this against your PostgreSQL database

-- Email whitelist for allowed patients
-- Add emails here BEFORE users sign up to auto-link them to their patient data
CREATE TABLE IF NOT EXISTS email_whitelist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),  -- Links to existing patient
    created_at TIMESTAMP DEFAULT NOW()
);

-- Maps Clerk accounts to your existing users table
CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,  -- Clerk's user ID
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),   -- Links to your patient data
    role VARCHAR(20) DEFAULT 'patient',     -- 'patient' or 'superuser'
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_clerk ON auth_users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_email ON email_whitelist(email);

-- IMPORTANT: After you sign up with Clerk, run this to grant yourself superuser access:
-- UPDATE auth_users SET role = 'superuser' WHERE email = 'YOUR_EMAIL_HERE';

-- Migration: Add reference_ranges table
-- Version: 003
-- Description: Creates a table for storing standard reference ranges for blood tests

-- Create reference_ranges table
CREATE TABLE IF NOT EXISTS reference_ranges (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    aliases TEXT[], -- PostgreSQL array for multiple aliases
    category VARCHAR(255),
    unit VARCHAR(100),
    
    -- General adult ranges (used when sex-specific not available)
    optimal_min DECIMAL,
    optimal_max DECIMAL,
    normal_min DECIMAL,
    normal_max DECIMAL,
    borderline_low DECIMAL,
    borderline_high DECIMAL,
    critical_low DECIMAL,
    critical_high DECIMAL,
    
    -- Male-specific ranges
    male_optimal_min DECIMAL,
    male_optimal_max DECIMAL,
    male_normal_min DECIMAL,
    male_normal_max DECIMAL,
    male_critical_low DECIMAL,
    male_critical_high DECIMAL,
    
    -- Female-specific ranges
    female_optimal_min DECIMAL,
    female_optimal_max DECIMAL,
    female_normal_min DECIMAL,
    female_normal_max DECIMAL,
    female_critical_low DECIMAL,
    female_critical_high DECIMAL,
    
    -- Metadata
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(test_name)
);

-- Create GIN index for efficient alias lookups
CREATE INDEX IF NOT EXISTS idx_reference_ranges_aliases ON reference_ranges USING GIN(aliases);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_reference_ranges_category ON reference_ranges(category);

-- Create function to find reference range by test name or alias
CREATE OR REPLACE FUNCTION find_reference_range(search_name TEXT)
RETURNS TABLE(
    id INTEGER,
    test_name VARCHAR,
    unit VARCHAR,
    optimal_min DECIMAL,
    optimal_max DECIMAL,
    normal_min DECIMAL,
    normal_max DECIMAL,
    critical_low DECIMAL,
    critical_high DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.test_name,
        r.unit,
        COALESCE(r.optimal_min, r.male_optimal_min, r.female_optimal_min) as optimal_min,
        COALESCE(r.optimal_max, r.male_optimal_max, r.female_optimal_max) as optimal_max,
        COALESCE(r.normal_min, r.male_normal_min, r.female_normal_min) as normal_min,
        COALESCE(r.normal_max, r.male_normal_max, r.female_normal_max) as normal_max,
        COALESCE(r.critical_low, r.male_critical_low, r.female_critical_low) as critical_low,
        COALESCE(r.critical_high, r.male_critical_high, r.female_critical_high) as critical_high
    FROM reference_ranges r
    WHERE UPPER(r.test_name) = UPPER(search_name)
       OR UPPER(search_name) = ANY(SELECT UPPER(unnest(r.aliases)));
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE reference_ranges IS 'Standard reference ranges for blood tests, sourced from Mayo Clinic, LabCorp, Quest Diagnostics, and other medical sources';

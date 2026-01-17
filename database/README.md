# Database Schema & Configuration

This directory contains SQL scripts for initializing and maintaining the PostgreSQL database used by the Health Tracker application.

## Files

| File | Purpose |
|------|---------|
| `01_init_schema.sql` | Creates tables (`users`, `lab_metrics`) and unique constraints |
| `02_normalization_trigger.sql` | Trigger function that normalizes test names on insert/update |

## Automatic Initialization

When using Docker Compose, these scripts run automatically on first container startup. The PostgreSQL image executes all `.sql` files in `/docker-entrypoint-initdb.d/` in alphabetical order.

## Manual Execution

If you need to apply these to an existing database:

```bash
# Schema (only if tables don't exist)
docker exec -i postgres_db psql -U user -d health_db < database/01_init_schema.sql

# Normalization trigger (safe to re-run)
docker exec -i postgres_db psql -U user -d health_db < database/02_normalization_trigger.sql
```

## Schema Overview

### `users` Table
```sql
id          SERIAL PRIMARY KEY
name        VARCHAR(255) NOT NULL
age         INTEGER
gender      VARCHAR(50)
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `lab_metrics` Table
```sql
id              SERIAL PRIMARY KEY
user_id         INTEGER REFERENCES users(id)
category        VARCHAR(255)
test_date       DATE
test_name       VARCHAR(255)
test_value      VARCHAR(255)
test_unit       VARCHAR(100)
test_range      VARCHAR(255)
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP

UNIQUE (user_id, test_date, test_name)  -- Prevents duplicates
```

## Normalization Rules

The `normalize_test_name_trigger` automatically converts test name variations to canonical names:

| Input Variations | Normalized To |
|------------------|---------------|
| `Vitamin D`, `25 Hydroxy Vitamin D`, `Vitamin D (25 Hydroxy)` | `VITAMIN D 25 HYDROXY` |
| `Vit B12`, `B12`, `Vitamin B-12` | `VITAMIN B12 CYANOCOBALAMIN` |
| `TSH`, `Thyroid Stimulating Hormone` | `TSH THYROID STIMULATING HORMONE` |
| `HDL`, `HDL Cholesterol`, `HDL-C` | `CHOLESTEROL HDL DIRECT` |
| `HB`, `HGB` | `HEMOGLOBIN` |
| `HbA1c`, `Glycated Hemoglobin`, `A1C` | `HEMOGLOBIN A1C` |
| `SGPT`, `ALT` | `SGPT ALT` |
| `SGOT`, `AST` | `SGOT AST` |
| `Creatinine`, `Serum Creatinine` | `CREATININE SERUM` |
| `Urea`, `Blood Urea` | `UREA SERUM` |

This ensures data consistency even if the AI extraction produces slightly different names from different lab reports.

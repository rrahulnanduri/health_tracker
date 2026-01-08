# Bug Fixes & Important Changes

This document tracks significant bug fixes and changes made to the n8n Health System.

---

## 2026-01-06: Database Duplicate Entries Fix

### Problem
Lab test data was being duplicated in the `lab_metrics` table when re-importing the same bloodwork PDF. Despite having a unique constraint and upsert logic, the system created multiple entries for the same test.

### Root Causes Identified

1. **Inconsistent Test Name Extraction**
   - Gemini extracted test names with varying formats:
     - `"Creatinine - Serum"` vs `"Creatinine-Serum"` vs `"CREATININE SERUM"`
     - `"Mean Corpuscular Hb Concn. (MCHC)"` vs `"Mean Corpuscular Hb Concn (MCHC)"`
   - JavaScript normalization was converting abbreviations inside parentheses incorrectly:
     - `"Pus Cells (WBCs)"` → `"Pus Cells (Wbcs)"` ❌

2. **Duplicate User Records**
   - User name case variations (`"RAHUL NANDURI"` vs `"Rahul Nanduri"`) created separate user records with different IDs
   - Since `user_id` is part of the unique constraint, entries bypassed duplicate detection

3. **Non-Deterministic LLM Output**
   - Gemini at temperature 0.4 produced different test extractions on each run
   - Sometimes extracted morphology observations (RBC, WBC, Platelets), sometimes not

4. **Inconsistent Category Names**
   - LLM generated variations: `"Blood Cell Counts"`, `"Complete Blood Count"`, `"Hematology"`
   - `"Urine Analysis"` vs `"Urinalysis"` vs `"Urinalysis"`

### Solution

#### 1. Gemini Configuration
- Set **temperature to 0** for deterministic output

#### 2. JavaScript Normalization (n8n Code Node)
Updated `normalizeTestName()` to:
- Remove hyphens, dashes, and periods
- Collapse multiple spaces
- Convert to Title Case
- **Preserve medical abbreviations** (WBCs, pH, MCHC, etc.) in uppercase

```javascript
const abbreviations = [
  'HDL', 'LDL', 'VLDL', 'RBC', 'WBC', 'WBCS', 'RBCS', 'PLT', 
  'TSH', 'MCH', 'MCHC', 'MCV', 'PH', // ... etc
];
```

#### 3. Category Mapping
Added standardized category mapping:
```javascript
'complete blood count' → 'Hematology'
'blood cell counts' → 'Hematology'
'urine analysis' → 'Urinalysis'
'kidney function' → 'Renal Function'
```

#### 4. Database Changes
- Applied `citext` extension to `users.name` for case-insensitive matching
- Added unique constraint on `users.name`
- Updated unique constraint on `lab_metrics` to `(user_id, test_name, test_date)`

### Verification
After fixes, running the same PDF import 3 times consecutively:
- Run 1: 60 rows
- Run 2: 60 rows ✅
- Run 3: 60 rows ✅

### Files Changed
- n8n workflow: AI Agent node (temperature), Code node (normalization)
- PostgreSQL: `users` table (citext), `lab_metrics` constraint

---

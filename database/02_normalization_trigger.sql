-- Test name normalization trigger
-- Ensures consistent naming even if AI extraction varies

-- Create the normalization function
CREATE OR REPLACE FUNCTION normalize_test_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure uppercase and trim
  NEW.test_name := UPPER(TRIM(NEW.test_name));
  NEW.category := UPPER(TRIM(NEW.category));
  
  -- Vitamin D normalization
  IF NEW.test_name LIKE '%VITAMIN D%' OR NEW.test_name LIKE '%25 HYDROXY%' OR NEW.test_name LIKE '%25-OH%' THEN
    NEW.test_name := 'VITAMIN D 25 HYDROXY';
  END IF;
  
  -- B12 normalization  
  IF NEW.test_name LIKE '%B12%' OR NEW.test_name LIKE '%B 12%' OR NEW.test_name LIKE '%CYANOCOBALAMIN%' THEN
    NEW.test_name := 'VITAMIN B12 CYANOCOBALAMIN';
  END IF;
  
  -- TSH normalization
  IF NEW.test_name LIKE '%THYROID STIMULATING%' OR NEW.test_name = 'TSH' THEN
    NEW.test_name := 'TSH THYROID STIMULATING HORMONE';
  END IF;
  
  -- HDL Cholesterol normalization
  IF NEW.test_name LIKE '%HDL%' AND NEW.test_name LIKE '%CHOLESTEROL%' THEN
    NEW.test_name := 'CHOLESTEROL HDL DIRECT';
  ELSIF NEW.test_name = 'HDL' OR NEW.test_name = 'HDL-C' THEN
    NEW.test_name := 'CHOLESTEROL HDL DIRECT';
  END IF;
  
  -- Hemoglobin normalization
  IF NEW.test_name IN ('HB', 'HGB') THEN
    NEW.test_name := 'HEMOGLOBIN';
  END IF;
  
  IF NEW.test_name LIKE '%HBA1C%' OR NEW.test_name LIKE '%GLYCATED%' OR NEW.test_name = 'A1C' THEN
    NEW.test_name := 'HEMOGLOBIN A1C';
  END IF;
  
  -- SGPT/ALT normalization
  IF NEW.test_name IN ('SGPT', 'ALT') OR NEW.test_name LIKE '%ALANINE AMINO%' THEN
    NEW.test_name := 'SGPT ALT';
  END IF;
  
  -- SGOT/AST normalization
  IF NEW.test_name IN ('SGOT', 'AST') OR NEW.test_name LIKE '%ASPARTATE AMINO%' THEN
    NEW.test_name := 'SGOT AST';
  END IF;
  
  -- Creatinine normalization
  IF NEW.test_name LIKE '%CREATININE%' AND NEW.test_name NOT LIKE '%RATIO%' THEN
    NEW.test_name := 'CREATININE SERUM';
  END IF;
  
  -- Urea normalization
  IF NEW.test_name LIKE '%UREA%' AND NEW.test_name NOT LIKE '%NITROGEN%' AND NEW.test_name NOT LIKE '%RATIO%' THEN
    NEW.test_name := 'UREA SERUM';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS normalize_test_name_trigger ON lab_metrics;
CREATE TRIGGER normalize_test_name_trigger
BEFORE INSERT OR UPDATE ON lab_metrics
FOR EACH ROW
EXECUTE FUNCTION normalize_test_name();

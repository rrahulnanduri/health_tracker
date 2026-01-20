-- Seed data for reference_ranges table
-- Generated from reference_ranges.json
-- Run this after 003_reference_ranges.sql migration

INSERT INTO reference_ranges (test_name, aliases, category, unit, optimal_min, optimal_max, normal_min, normal_max, critical_low, critical_high, male_optimal_min, male_optimal_max, male_normal_min, male_normal_max, male_critical_low, male_critical_high, female_optimal_min, female_optimal_max, female_normal_min, female_normal_max, female_critical_low, female_critical_high, source)
VALUES
-- Complete Blood Count (CBC)
('Red Blood Cell Count', ARRAY['RBC', 'Total RBC Count', 'Red Blood Cells', 'Erythrocyte Count'], 'Complete Blood Count (CBC)', 'million cells/µL', NULL, NULL, NULL, NULL, NULL, NULL, 4.5, 5.5, 4.35, 5.65, 4.0, 6.0, 4.0, 5.0, 3.92, 5.13, 3.5, 5.5, 'Mayo Clinic, LabCorp'),
('Hemoglobin', ARRAY['Haemoglobin', 'Hb', 'Hgb'], 'Complete Blood Count (CBC)', 'g/dL', NULL, NULL, NULL, NULL, NULL, NULL, 14.0, 17.0, 13.5, 17.5, 7.0, 20.0, 12.5, 15.5, 12.0, 16.0, 7.0, 18.0, 'Mayo Clinic, LabCorp'),
('Hematocrit', ARRAY['HCT', 'PCV', 'Packed Cell Volume'], 'Complete Blood Count (CBC)', '%', NULL, NULL, NULL, NULL, NULL, NULL, 40, 50, 38.3, 48.6, 30, 55, 36, 44, 35.5, 44.9, 28, 50, 'Mayo Clinic, LabCorp'),
('White Blood Cell Count', ARRAY['WBC', 'Total WBC Count', 'Leukocytes', 'Leukocyte Count'], 'Complete Blood Count (CBC)', 'cells/µL', 5000, 8000, 4500, 11000, 2000, 30000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Platelet Count', ARRAY['Platelets', 'PLT', 'Thrombocytes'], 'Complete Blood Count (CBC)', 'cells/µL', 175000, 300000, 150000, 400000, 50000, 1000000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Mean Cell Volume', ARRAY['MCV'], 'Complete Blood Count (CBC)', 'fL', 82, 94, 80, 100, 60, 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Mean Cell Hemoglobin', ARRAY['MCH', 'Mean Cell Haemoglobin'], 'Complete Blood Count (CBC)', 'pg', 28, 32, 27, 33, 20, 40, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Mean Corpuscular Hemoglobin Concentration', ARRAY['MCHC', 'Mean Corpuscular Hb Concn'], 'Complete Blood Count (CBC)', 'g/dL', 33, 35, 32, 36, 28, 40, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Red Cell Distribution Width', ARRAY['RDW', 'RDW-CV'], 'Complete Blood Count (CBC)', '%', 11.5, 13.5, 11.0, 15.0, NULL, 20.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Neutrophils', ARRAY['Neutrophils %', 'Segs', 'Polys'], 'Complete Blood Count (CBC)', '%', 50, 65, 40, 70, 20, 85, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Absolute Neutrophil Count', ARRAY['ANC'], 'Complete Blood Count (CBC)', 'cells/µL', 2500, 6000, 1500, 8000, 500, 20000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Lymphocytes', ARRAY['Lymphocytes %', 'Lymphs'], 'Complete Blood Count (CBC)', '%', 25, 35, 20, 40, 5, 70, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Absolute Lymphocyte Count', ARRAY['ALC'], 'Complete Blood Count (CBC)', 'cells/µL', 1200, 3000, 1000, 4800, 500, 10000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Monocytes', ARRAY['Monocytes %', 'Monos'], 'Complete Blood Count (CBC)', '%', 4, 8, 2, 10, NULL, 20, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Absolute Monocyte Count', ARRAY['AMC'], 'Complete Blood Count (CBC)', 'cells/µL', 200, 600, 100, 1000, NULL, 2000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Eosinophils', ARRAY['Eosinophils %', 'Eos'], 'Complete Blood Count (CBC)', '%', 1, 4, 1, 6, NULL, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Absolute Eosinophil Count', ARRAY['AEC'], 'Complete Blood Count (CBC)', 'cells/µL', 50, 300, 15, 500, NULL, 1500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Basophils', ARRAY['Basophils %', 'Basos'], 'Complete Blood Count (CBC)', '%', 0, 1, 0, 2, NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Absolute Basophils Count', ARRAY['ABC'], 'Complete Blood Count (CBC)', 'cells/µL', 0, 100, 0, 200, NULL, 500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),

-- Lipid Panel
('Total Cholesterol', ARRAY['Cholesterol Total', 'TC', 'Serum Cholesterol'], 'Lipid Panel', 'mg/dL', NULL, 150, NULL, 200, NULL, 300, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NCEP ATP III'),
('HDL Cholesterol', ARRAY['Cholesterol HDL Direct', 'HDL-C', 'Good Cholesterol'], 'Lipid Panel', 'mg/dL', NULL, NULL, NULL, NULL, NULL, NULL, 60, NULL, 40, NULL, 35, NULL, 60, NULL, 50, NULL, 40, NULL, 'NCEP ATP III'),
('LDL Cholesterol', ARRAY['LDL-C', 'Bad Cholesterol'], 'Lipid Panel', 'mg/dL', NULL, 70, NULL, 100, NULL, 190, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NCEP ATP III'),
('VLDL Cholesterol', ARRAY['VLDL-C'], 'Lipid Panel', 'mg/dL', NULL, 20, 5, 40, NULL, 60, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Triglycerides', ARRAY['TG', 'Trigs'], 'Lipid Panel', 'mg/dL', NULL, 100, NULL, 150, NULL, 500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NCEP ATP III'),
('Non-HDL Cholesterol', ARRAY['Non HDL Cholesterol'], 'Lipid Panel', 'mg/dL', NULL, 100, NULL, 130, NULL, 190, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ACC/AHA'),
('Cholesterol/HDL Ratio', ARRAY['Chol/HDL Ratio', 'TC/HDL Ratio'], 'Lipid Panel', 'ratio', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4.0, NULL, 5.0, NULL, 7.0, NULL, 3.5, NULL, 4.5, NULL, 6.5, 'Framingham'),
('LDL/HDL Ratio', ARRAY[]::TEXT[], 'Lipid Panel', 'ratio', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.5, NULL, 3.5, NULL, 4.5, NULL, 2.0, NULL, 3.0, NULL, 4.0, 'Framingham'),
('HDL/LDL Ratio', ARRAY[]::TEXT[], 'Lipid Panel', 'ratio', 0.5, NULL, 0.3, NULL, 0.2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Framingham'),

-- Metabolic Panel
('Fasting Glucose', ARRAY['Glucose Fasting', 'FBS', 'Fasting Blood Sugar', 'Blood Glucose Fasting'], 'Metabolic Panel', 'mg/dL', 70, 85, 70, 99, 50, 400, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ADA'),
('HbA1c', ARRAY['Glyco Hb (HBA1C)', 'Glycated Hemoglobin', 'A1C', 'Hemoglobin A1c'], 'Metabolic Panel', '%', NULL, 5.4, NULL, 5.6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ADA'),
('Estimated Average Glucose', ARRAY['eAG'], 'Metabolic Panel', 'mg/dL', NULL, 111, NULL, 117, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ADA'),
('Calcium', ARRAY['Serum Calcium', 'Total Calcium'], 'Metabolic Panel', 'mg/dL', 9.0, 10.0, 8.6, 10.3, 7.0, 12.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Sodium', ARRAY['Na', 'Serum Sodium'], 'Metabolic Panel', 'mEq/L', 138, 142, 136, 145, 120, 160, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Potassium', ARRAY['K', 'Serum Potassium'], 'Metabolic Panel', 'mEq/L', 4.0, 4.5, 3.5, 5.0, 2.5, 6.5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Chloride', ARRAY['Cl', 'Serum Chloride'], 'Metabolic Panel', 'mEq/L', 100, 104, 98, 106, 80, 120, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Magnesium', ARRAY['Serum Magnesium', 'Mg'], 'Metabolic Panel', 'mg/dL', 2.0, 2.4, 1.7, 2.6, 1.0, 4.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Phosphorus', ARRAY['Serum Phosphorus', 'Phosphate', 'PO4'], 'Metabolic Panel', 'mg/dL', 3.0, 4.0, 2.5, 4.5, 1.0, 8.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Insulin Fasting', ARRAY['Fasting Insulin', 'Serum Insulin'], 'Metabolic Panel', 'µIU/mL', 2, 6, 2.6, 25, NULL, 50, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NCBI'),
('C-Peptide', ARRAY['Connecting Peptide'], 'Metabolic Panel', 'ng/mL', 1.0, 2.0, 0.8, 3.1, 0.5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),

-- Kidney Function
('Creatinine', ARRAY['Creatinine Serum', 'Serum Creatinine'], 'Kidney Function', 'mg/dL', NULL, NULL, NULL, NULL, NULL, NULL, 0.8, 1.2, 0.7, 1.3, 0.4, 10.0, 0.6, 1.0, 0.5, 1.1, 0.3, 10.0, 'Mayo Clinic'),
('Blood Urea Nitrogen', ARRAY['BUN', 'Blood Urea Nitrogen BUN', 'Urea Nitrogen'], 'Kidney Function', 'mg/dL', 10, 16, 6, 20, 2, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Urea', ARRAY['Urea Serum', 'Blood Urea'], 'Kidney Function', 'mg/dL', 15, 35, 15, 45, 5, 200, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('BUN/Creatinine Ratio', ARRAY['BUN / Creatinine Ratio', 'Urea Creatinine Ratio', 'Urea/Creatinine Ratio'], 'Kidney Function', 'ratio', 10, 16, 10, 20, 5, 30, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Uric Acid', ARRAY['Serum Uric Acid'], 'Kidney Function', 'mg/dL', NULL, NULL, NULL, NULL, NULL, NULL, 3.5, 6.0, 3.4, 7.0, NULL, 12.0, 2.5, 5.5, 2.4, 6.0, NULL, 10.0, 'Mayo Clinic'),
('eGFR', ARRAY['Estimated Glomerular Filtration Rate', 'GFR'], 'Kidney Function', 'mL/min/1.73m²', 90, NULL, 60, NULL, 15, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'KDIGO'),

-- Liver Function
('ALT', ARRAY['Alanine Transaminase (ALT/Sgpt)', 'SGPT', 'Alanine Aminotransferase'], 'Liver Function', 'U/L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25, NULL, 41, NULL, 200, NULL, 20, NULL, 33, NULL, 150, 'Mayo Clinic'),
('AST', ARRAY['Aspartate Aminotransferase (AST/Sgot)', 'SGOT', 'Aspartate Transaminase'], 'Liver Function', 'U/L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 25, NULL, 40, NULL, 200, NULL, 22, NULL, 32, NULL, 150, 'Mayo Clinic'),
('AST/ALT Ratio', ARRAY['Sgot/Sgpt', 'De Ritis Ratio'], 'Liver Function', 'ratio', 0.7, 1.0, 0.5, 1.3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'NCBI'),
('Alkaline Phosphatase', ARRAY['Alkaline Phosphatase Alpi', 'ALP', 'Alk Phos'], 'Liver Function', 'U/L', NULL, NULL, NULL, NULL, NULL, NULL, 45, 100, 44, 147, NULL, 500, 35, 90, 35, 104, NULL, 400, 'Mayo Clinic'),
('GGT', ARRAY['GGT Gamma Glutamyl Transpeptidase', 'Gamma GT', 'Gamma-Glutamyl Transferase'], 'Liver Function', 'U/L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 30, NULL, 65, NULL, 250, NULL, 25, NULL, 36, NULL, 200, 'Mayo Clinic'),
('Bilirubin Total', ARRAY['Total Bilirubin'], 'Liver Function', 'mg/dL', 0.2, 0.8, 0.1, 1.2, NULL, 15.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Bilirubin Direct', ARRAY['Conjugated Bilirubin', 'Direct Bilirubin'], 'Liver Function', 'mg/dL', 0.0, 0.2, 0.0, 0.3, NULL, 5.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Bilirubin Indirect', ARRAY['Unconjugated Bilirubin', 'Indirect Bilirubin'], 'Liver Function', 'mg/dL', 0.1, 0.6, 0.1, 0.9, NULL, 10.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Albumin', ARRAY['Serum Albumin', 'Alb'], 'Liver Function', 'g/dL', 4.0, 5.0, 3.5, 5.0, 2.0, 6.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Globulin', ARRAY['Serum Globulin'], 'Liver Function', 'g/dL', 2.3, 3.0, 2.0, 3.5, 1.0, 5.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Total Protein', ARRAY['Serum Total Protein', 'TP'], 'Liver Function', 'g/dL', 6.5, 7.5, 6.0, 8.3, 4.0, 10.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('A/G Ratio', ARRAY['Albumin/Globulin Ratio', 'AG Ratio'], 'Liver Function', 'ratio', 1.2, 1.8, 1.1, 2.5, 0.5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),

-- Thyroid Panel
('TSH', ARRAY['TSH (Thyroid Stimulating Hormone)', 'Thyroid Stimulating Hormone', 'Thyrotropin'], 'Thyroid Panel', 'mIU/L', 1.0, 2.5, 0.4, 4.0, 0.01, 50.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('T3', ARRAY['T3 (Tri Iodothyronine)', 'Total T3', 'Triiodothyronine'], 'Thyroid Panel', 'ng/dL', 100, 160, 80, 200, 40, 400, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('T4', ARRAY['T4 (Thyroxne)', 'Total T4', 'Thyroxine'], 'Thyroid Panel', 'µg/dL', 6.0, 10.0, 4.5, 12.5, 2.0, 20.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Free T3', ARRAY['FT3'], 'Thyroid Panel', 'pg/mL', 3.0, 4.0, 2.3, 4.2, 1.0, 10.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Free T4', ARRAY['FT4'], 'Thyroid Panel', 'ng/dL', 1.0, 1.5, 0.8, 1.8, 0.3, 5.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),

-- Iron Studies
('Iron', ARRAY['Serum Iron', 'Fe'], 'Iron Studies', 'µg/dL', NULL, NULL, NULL, NULL, NULL, NULL, 80, 150, 60, 170, 30, 300, 60, 140, 37, 145, 20, 300, 'Mayo Clinic'),
('TIBC', ARRAY['Tibc', 'Total Iron Binding Capacity'], 'Iron Studies', 'µg/dL', 280, 350, 250, 400, 150, 500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('UIBC', ARRAY['Uibc', 'Unsaturated Iron Binding Capacity'], 'Iron Studies', 'µg/dL', 150, 280, 100, 350, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Transferrin', ARRAY['Serum Transferrin'], 'Iron Studies', 'mg/dL', 220, 340, 200, 360, 100, 500, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Transferrin Saturation', ARRAY['TSAT', 'Iron Saturation'], 'Iron Studies', '%', NULL, NULL, NULL, NULL, NULL, NULL, 25, 40, 20, 50, 10, 70, 20, 35, 15, 50, 8, 70, 'Mayo Clinic'),
('Ferritin', ARRAY['Serum Ferritin'], 'Iron Studies', 'ng/mL', NULL, NULL, NULL, NULL, NULL, NULL, 50, 150, 30, 400, 12, 1000, 30, 120, 15, 150, 10, 500, 'Mayo Clinic'),

-- Vitamins
('Vitamin D', ARRAY['VITAMIN D 25 HYDROXY', '25-Hydroxy Vitamin D', '25(OH)D', 'Vitamin D 25-OH'], 'Vitamins', 'ng/mL', 40, 60, 30, 100, 20, 150, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Endocrine Society'),
('Vitamin B12', ARRAY['Vitamin B12 Cyanocobalamin', 'Cobalamin', 'Cyanocobalamin'], 'Vitamins', 'pg/mL', 500, 900, 200, 1100, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Folate', ARRAY['Folic Acid', 'Serum Folate', 'Vitamin B9'], 'Vitamins', 'ng/mL', 10, 20, 3, 20, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),

-- Inflammatory Markers
('CRP', ARRAY['C-Reactive Protein', 'hs-CRP', 'High Sensitivity CRP'], 'Inflammatory Markers', 'mg/L', NULL, 1.0, NULL, 3.0, NULL, 50.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AHA'),
('ESR', ARRAY['Erythrocyte Sedimentation Rate', 'Sed Rate'], 'Inflammatory Markers', 'mm/hr', NULL, 10, NULL, 20, NULL, 100, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Homocysteine', ARRAY['Serum Homocysteine', 'Plasma Homocysteine'], 'Cardiovascular Risk', 'µmol/L', NULL, 8.0, 5.0, 15.0, NULL, 100.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'AHA'),

-- Hormones
('Testosterone Total', ARRAY['Total Testosterone', 'Serum Testosterone'], 'Hormones', 'ng/dL', NULL, NULL, NULL, NULL, NULL, NULL, 500, 900, 270, 1070, 200, NULL, 15, 50, 15, 70, NULL, NULL, 'Endocrine Society'),
('Estradiol', ARRAY['E2', 'Serum Estradiol'], 'Hormones', 'pg/mL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 10, 40, NULL, 60, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic'),
('Cortisol AM', ARRAY['Morning Cortisol', 'Serum Cortisol AM'], 'Hormones', 'µg/dL', 10, 18, 6.2, 19.4, 3.0, 30.0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Mayo Clinic')

ON CONFLICT (test_name) DO UPDATE SET
    aliases = EXCLUDED.aliases,
    category = EXCLUDED.category,
    unit = EXCLUDED.unit,
    optimal_min = EXCLUDED.optimal_min,
    optimal_max = EXCLUDED.optimal_max,
    normal_min = EXCLUDED.normal_min,
    normal_max = EXCLUDED.normal_max,
    critical_low = EXCLUDED.critical_low,
    critical_high = EXCLUDED.critical_high,
    male_optimal_min = EXCLUDED.male_optimal_min,
    male_optimal_max = EXCLUDED.male_optimal_max,
    male_normal_min = EXCLUDED.male_normal_min,
    male_normal_max = EXCLUDED.male_normal_max,
    male_critical_low = EXCLUDED.male_critical_low,
    male_critical_high = EXCLUDED.male_critical_high,
    female_optimal_min = EXCLUDED.female_optimal_min,
    female_optimal_max = EXCLUDED.female_optimal_max,
    female_normal_min = EXCLUDED.female_normal_min,
    female_normal_max = EXCLUDED.female_normal_max,
    female_critical_low = EXCLUDED.female_critical_low,
    female_critical_high = EXCLUDED.female_critical_high,
    source = EXCLUDED.source;

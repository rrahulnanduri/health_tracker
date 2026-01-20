import type { Metric } from './types';

export function normalizeMetricName(name: string): string {
    return name.trim().toUpperCase();
}

export function groupMetricsByCategory(metrics: Metric[]): Record<string, Metric[]> {
    const groups: Record<string, Metric[]> = {};

    for (const metric of metrics) {
        const category = metric.category || 'Uncategorized';
        // Normalize category case if needed, but assuming consistent from DB for now
        const upperCat = category.toUpperCase();

        if (!groups[upperCat]) {
            groups[upperCat] = [];
        }
        groups[upperCat].push(metric);
    }

    return groups;
}

export function groupMetricsByTestName(metrics: Metric[]): Record<string, Metric[]> {
    const groups: Record<string, Metric[]> = {};

    for (const metric of metrics) {
        // Normalize: UPPERCASE trim
        const name = normalizeMetricName(metric.test_name);
        if (!groups[name]) {
            groups[name] = [];
        }
        groups[name].push(metric);
    }

    // Sort each group by date ascending
    for (const key of Object.keys(groups)) {
        groups[key].sort((a, b) => {
            const dateA = new Date(a.test_date).getTime();
            const dateB = new Date(b.test_date).getTime();
            return dateA - dateB;
        });
    }

    return groups;
}

export function groupMetricsByDate(metrics: Metric[]): Record<string, Metric[]> {
    const groups: Record<string, Metric[]> = {};

    // 1. Group by date string (YYYY-MM-DD or readable format depending on how we render)
    // We'll use the raw date for sorting keys, but maybe ISO string for the map key.
    for (const metric of metrics) {
        // Ensure test_date is a Date object or string consistent
        const d = new Date(metric.test_date);
        const dateKey = d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(metric);
    }

    // 2. Sorting & Deduplication inside each group
    for (const dateKey of Object.keys(groups)) {
        let groupMetrics = groups[dateKey];

        // Map key: "NORMALIZED_TEST_NAME" -> Metric
        const uniqueMap = new Map<string, Metric>();

        for (const m of groupMetrics) {
            const name = normalizeMetricName(m.test_name);
            const existing = uniqueMap.get(name);

            if (!existing) {
                uniqueMap.set(name, m);
            } else {
                // Conflict! Check recorded_at to keep the latest one.
                const existingRec = existing.recorded_at
                    ? new Date(existing.recorded_at).getTime()
                    : 0;
                const currentRec = m.recorded_at
                    ? new Date(m.recorded_at).getTime()
                    : 0;

                if (currentRec > existingRec) {
                    uniqueMap.set(name, m);
                }
            }
        }

        // Convert back to array
        let deduplicated = Array.from(uniqueMap.values());

        // Sort by abnormality then name (same logic as before)
        deduplicated.sort((a, b) => {
            const aAbnormal = isMetricAbnormal(a);
            const bAbnormal = isMetricAbnormal(b);

            if (aAbnormal && !bAbnormal) return -1;
            if (!aAbnormal && bAbnormal) return 1;

            return a.test_name.localeCompare(b.test_name);
        });

        groups[dateKey] = deduplicated;
    }

    return groups;
}

/**
 * Default reference ranges for common blood tests.
 * Used as fallback when lab reports don't provide range data.
 * Keys are normalized (UPPERCASE, trimmed).
 * Sources: Mayo Clinic, LabCorp, Quest Diagnostics, NCEP ATP III
 */
const DEFAULT_REFERENCE_RANGES: Record<string, { min: number; max: number }> = {
    // Complete Blood Count (CBC)
    "HEMOGLOBIN": { min: 12.0, max: 17.5 },
    "HAEMOGLOBIN": { min: 12.0, max: 17.5 },
    "HB": { min: 12.0, max: 17.5 },
    "HGB": { min: 12.0, max: 17.5 },
    "HEMATOCRIT": { min: 35.5, max: 48.6 },
    "HCT": { min: 35.5, max: 48.6 },
    "PCV": { min: 35.5, max: 48.6 },
    "RED BLOOD CELL COUNT": { min: 3.92, max: 5.65 },
    "RBC": { min: 3.92, max: 5.65 },
    "TOTAL RBC COUNT": { min: 3.92, max: 5.65 },
    "RED BLOOD CELLS": { min: 3.92, max: 5.65 },
    "WHITE BLOOD CELL COUNT": { min: 4500, max: 11000 },
    "WBC": { min: 4500, max: 11000 },
    "TOTAL WBC COUNT": { min: 4500, max: 11000 },
    "LEUKOCYTES": { min: 4500, max: 11000 },
    "PLATELET COUNT": { min: 150000, max: 400000 },
    "PLATELETS": { min: 150000, max: 400000 },
    "PLT": { min: 150000, max: 400000 },
    "MEAN CELL VOLUME (MCV)": { min: 80, max: 100 },
    "MCV": { min: 80, max: 100 },
    "MEAN CELL HAEMOGLOBIN (MCH)": { min: 27, max: 33 },
    "MCH": { min: 27, max: 33 },
    "MEAN CORPUSCULAR HB CONCN (MCHC)": { min: 32, max: 36 },
    "MCHC": { min: 32, max: 36 },
    "RED CELL DISTRIBUTION WIDTH": { min: 11.0, max: 15.0 },
    "RDW": { min: 11.0, max: 15.0 },
    "NEUTROPHILS": { min: 40, max: 70 },
    "ABSOLUTE NEUTROPHIL COUNT": { min: 1500, max: 8000 },
    "LYMPHOCYTES": { min: 20, max: 40 },
    "ABSOLUTE LYMPHOCYTE COUNT": { min: 1000, max: 4800 },
    "MONOCYTES": { min: 2, max: 10 },
    "ABSOLUTE MONOCYTE COUNT": { min: 100, max: 1000 },
    "EOSINOPHILS": { min: 1, max: 6 },
    "ABSOLUTE EOSINOPHIL COUNT": { min: 15, max: 500 },
    "BASOPHILS": { min: 0, max: 2 },
    "ABSOLUTE BASOPHILS COUNT": { min: 0, max: 200 },

    // Lipid Panel
    "CHOLESTEROL TOTAL": { min: 0, max: 200 },
    "TOTAL CHOLESTEROL": { min: 0, max: 200 },
    "CHOLESTEROL HDL DIRECT": { min: 40, max: 200 },
    "HDL CHOLESTEROL": { min: 40, max: 200 },
    "HDL-C": { min: 40, max: 200 },
    "LDL CHOLESTEROL": { min: 0, max: 100 },
    "LDL-C": { min: 0, max: 100 },
    "VLDL CHOLESTEROL": { min: 5, max: 40 },
    "TRIGLYCERIDES": { min: 0, max: 150 },
    "NON HDL CHOLESTEROL": { min: 0, max: 130 },
    "CHOL/HDL RATIO": { min: 0, max: 5.0 },
    "LDL/HDL RATIO": { min: 0, max: 3.5 },
    "HDL/LDL RATIO": { min: 0.3, max: 10 },

    // Metabolic Panel
    "GLUCOSE FASTING": { min: 70, max: 99 },
    "FBS": { min: 70, max: 99 },
    "FASTING BLOOD SUGAR": { min: 70, max: 99 },
    "GLYCO HB (HBA1C)": { min: 0, max: 5.6 },
    "HBA1C": { min: 0, max: 5.6 },
    "ESTIMATED AVERAGE GLUCOSE": { min: 0, max: 117 },
    "CALCIUM": { min: 8.6, max: 10.3 },
    "SODIUM": { min: 136, max: 145 },
    "POTASSIUM": { min: 3.5, max: 5.0 },
    "CHLORIDE": { min: 98, max: 106 },

    // Kidney Function
    "CREATININE": { min: 0.5, max: 1.3 },
    "CREATININE SERUM": { min: 0.5, max: 1.3 },
    "BLOOD UREA NITROGEN": { min: 6, max: 20 },
    "BLOOD UREA NITROGEN BUN": { min: 6, max: 20 },
    "BUN": { min: 6, max: 20 },
    "UREA": { min: 15, max: 45 },
    "UREA SERUM": { min: 15, max: 45 },
    "BUN / CREATININE RATIO": { min: 10, max: 20 },
    "UREA CREATININE RATIO": { min: 10, max: 20 },
    "URIC ACID": { min: 2.4, max: 7.0 },

    // Liver Function
    "ALANINE TRANSAMINASE (ALT/SGPT)": { min: 0, max: 41 },
    "ALT": { min: 0, max: 41 },
    "SGPT": { min: 0, max: 41 },
    "ASPARTATE AMINOTRANSFERASE (AST/SGOT)": { min: 0, max: 40 },
    "AST": { min: 0, max: 40 },
    "SGOT": { min: 0, max: 40 },
    "SGOT/SGPT": { min: 0.5, max: 1.3 },
    "ALKALINE PHOSPHATASE ALPI": { min: 35, max: 147 },
    "ALP": { min: 35, max: 147 },
    "GGT GAMMA GLUTAMYL TRANSPEPTIDASE": { min: 0, max: 65 },
    "GGT": { min: 0, max: 65 },
    "BILIRUBIN TOTAL": { min: 0.1, max: 1.2 },
    "BILIRUBIN": { min: 0.1, max: 1.2 },
    "BILIRUBIN DIRECT": { min: 0.0, max: 0.3 },
    "BILIRUBIN INDIRECT": { min: 0.1, max: 0.9 },
    "ALBUMIN": { min: 3.5, max: 5.0 },
    "SERUM ALBUMIN": { min: 3.5, max: 5.0 },
    "GLOBULIN": { min: 2.0, max: 3.5 },
    "TOTAL PROTEIN": { min: 6.0, max: 8.3 },
    "A/G RATIO": { min: 1.1, max: 2.5 },

    // Thyroid Panel
    "TSH (THYROID STIMULATING HORMONE)": { min: 0.4, max: 4.0 },
    "TSH": { min: 0.4, max: 4.0 },
    "T3 (TRI IODOTHYRONINE)": { min: 80, max: 200 },
    "T3": { min: 80, max: 200 },
    "T4 (THYROXNE)": { min: 4.5, max: 12.5 },
    "T4": { min: 4.5, max: 12.5 },

    // Iron Studies
    "IRON": { min: 37, max: 170 },
    "TIBC": { min: 250, max: 400 },
    "UIBC": { min: 100, max: 350 },
    "TRANSFERRIN": { min: 200, max: 360 },
    "TRANSFERRIN SATURATION": { min: 15, max: 50 },

    // Vitamins
    "VITAMIN D 25 HYDROXY": { min: 30, max: 100 },
    "VITAMIN D": { min: 30, max: 100 },
    "VITAMIN B12 CYANOCOBALAMIN": { min: 200, max: 1100 },
    "VITAMIN B12": { min: 200, max: 1100 },

    // Urinalysis (numeric)
    "REACTION (PH)": { min: 4.5, max: 8.0 },
    "SPECIFIC GRAVITY": { min: 1.005, max: 1.030 },
};

/**
 * Parse reference range string from lab report, with optional fallback lookup.
 * @param rangeStr - The reference range string from the lab report
 * @param testName - Optional test name for fallback lookup
 * @returns Parsed range or null
 */
export function parseRange(rangeStr: string | null, testName?: string): { min: number; max: number } | null {
    // First, try to parse the provided range string
    if (rangeStr) {
        const parsed = parseRangeFromString(rangeStr);
        if (parsed) return parsed;
    }

    // Fallback: lookup by test name
    if (testName) {
        const normalized = testName.trim().toUpperCase();
        const fallback = DEFAULT_REFERENCE_RANGES[normalized];
        if (fallback) return fallback;
    }

    return null;
}

/**
 * Internal helper to parse reference range from string
 */
function parseRangeFromString(rangeStr: string): { min: number; max: number } | null {
    const s = rangeStr.trim();

    // Helper to parse numbers from a string segment
    const getNums = (str: string) => {
        const matches = str.match(/([0-9]+(\.[0-9]+)?)/g);
        return matches ? matches.map(parseFloat) : [];
    };

    // Strategy 1: Look for explicit "Optimal", "Normal", "Desirable" keywords
    // We treat these as the "Safe Range"
    const keywords = ["OPTIMAL", "NORMAL", "DESIRABLE", "TARGET"];
    const upperStr = s.toUpperCase();

    for (const kw of keywords) {
        const idx = upperStr.indexOf(kw);
        if (idx !== -1) {
            const segment = s.slice(idx + kw.length);

            // Check for inequalities first "./<100" or "<= 100"
            // Support: <, <=, ≤
            const lessMatch = segment.match(/[:\s]*[<≤]=?\s*([0-9.]+)/);
            if (lessMatch) {
                const val = parseFloat(lessMatch[1]);
                if (!isNaN(val)) return { min: 0, max: val };
            }

            const moreMatch = segment.match(/[:\s]*[>≥]=?\s*([0-9.]+)/);
            if (moreMatch) {
                const val = parseFloat(moreMatch[1]);
                if (!isNaN(val)) return { min: val, max: val * 2 };
            }

            const rangeMatch = segment.match(/[:\s]*([0-9.]+)\s*-\s*([0-9.]+)/);
            if (rangeMatch) {
                const min = parseFloat(rangeMatch[1]);
                const max = parseFloat(rangeMatch[2]);
                if (!isNaN(min) && !isNaN(max)) return { min, max };
            }
        }
    }

    // Strategy 2: Simple inequality at start of string (e.g. "< 5.0")
    const startLess = s.match(/^[<≤]=?\s*([0-9.]+)/);
    if (startLess) {
        const val = parseFloat(startLess[1]);
        if (!isNaN(val)) return { min: 0, max: val };
    }

    const startMore = s.match(/^[>≥]=?\s*([0-9.]+)/);
    if (startMore) {
        const val = parseFloat(startMore[1]);
        if (!isNaN(val)) return { min: val, max: val * 2 };
    }

    // Strategy 3: Standard dash range ("13.5 - 17.5")
    const dashMatch = s.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
    if (dashMatch) {
        const min = parseFloat(dashMatch[1]);
        const max = parseFloat(dashMatch[2]);
        if (!isNaN(min) && !isNaN(max)) return { min, max };
    }

    return null;
}

export function isMetricAbnormal(metric: Metric): boolean {
    if (typeof metric.test_value === "number") {
        const range = parseRange(metric.ref_range);
        if (range) {
            return metric.test_value < range.min || metric.test_value > range.max;
        }
        return false;
    }
    const val = String(metric.test_value).toUpperCase();
    const safeValues = [
        "NEGATIVE",
        "NORMAL",
        "ABSENT",
        "CLEAR",
        "PALE YELLOW",
    ];
    return !safeValues.includes(val);
}

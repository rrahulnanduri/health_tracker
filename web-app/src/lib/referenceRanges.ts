/**
 * Reference Range Lookup Module
 * 
 * Provides functions to look up standard reference ranges for blood tests
 * by matching test names or aliases against the reference database.
 */

import referenceData from '../../../database/reference_ranges.json';

interface ReferenceRange {
    test_name: string;
    aliases: string[];
    category: string;
    unit: string;
    ranges: {
        adult?: RangeValues;
        adult_male?: RangeValues;
        adult_female?: RangeValues;
    };
}

interface RangeValues {
    optimal_min?: number | null;
    optimal_max?: number | null;
    normal_min?: number | null;
    normal_max?: number | null;
    critical_low?: number | null;
    critical_high?: number | null;
}

// Type assertion for the imported JSON
const tests = referenceData.tests as ReferenceRange[];

// Build a lookup map for fast access
const nameToRangeMap = new Map<string, ReferenceRange>();
const aliasToRangeMap = new Map<string, ReferenceRange>();

for (const test of tests) {
    // Index by normalized test name
    nameToRangeMap.set(test.test_name.toUpperCase().trim(), test);

    // Index by each alias
    for (const alias of test.aliases) {
        aliasToRangeMap.set(alias.toUpperCase().trim(), test);
    }
}

/**
 * Find a reference range for a given test name.
 * Matches by exact name first, then by alias.
 */
export function findReferenceRange(testName: string): ReferenceRange | null {
    const normalized = testName.toUpperCase().trim();

    // Try exact name match first
    if (nameToRangeMap.has(normalized)) {
        return nameToRangeMap.get(normalized)!;
    }

    // Try alias match
    if (aliasToRangeMap.has(normalized)) {
        return aliasToRangeMap.get(normalized)!;
    }

    // Try partial matching (for cases like "Glucose Fasting" vs "Fasting Glucose")
    for (const [key, range] of nameToRangeMap) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return range;
        }
    }

    for (const [key, range] of aliasToRangeMap) {
        if (normalized.includes(key) || key.includes(normalized)) {
            return range;
        }
    }

    return null;
}

/**
 * Format a reference range as a string (e.g., "70 - 100 mg/dL")
 * Prefers adult ranges, falls back to male/female ranges.
 */
export function formatReferenceRange(testName: string): string | null {
    const range = findReferenceRange(testName);
    if (!range) return null;

    // Prefer adult, then male, then female ranges
    const values = range.ranges.adult || range.ranges.adult_male || range.ranges.adult_female;
    if (!values) return null;

    // Use normal range if available, otherwise optimal
    const min = values.normal_min ?? values.optimal_min;
    const max = values.normal_max ?? values.optimal_max;

    if (min !== null && min !== undefined && max !== null && max !== undefined) {
        return `${min} - ${max}`;
    } else if (max !== null && max !== undefined) {
        return `< ${max}`;
    } else if (min !== null && min !== undefined) {
        return `> ${min}`;
    }

    return null;
}

/**
 * Get reference range with unit for display
 */
export function getReferenceRangeWithUnit(testName: string): string | null {
    const range = findReferenceRange(testName);
    if (!range) return null;

    const formattedRange = formatReferenceRange(testName);
    if (!formattedRange) return null;

    // Include unit if available and not already in range
    if (range.unit && !formattedRange.includes(range.unit)) {
        return formattedRange;
    }

    return formattedRange;
}

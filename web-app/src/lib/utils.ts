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

export function parseRange(rangeStr: string | null): { min: number; max: number } | null {
    if (!rangeStr) return null;
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

            // Check for inequalities first "./< 100" or "<= 100"
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

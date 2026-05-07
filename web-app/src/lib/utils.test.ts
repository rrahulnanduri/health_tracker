import { describe, it, expect } from 'vitest';
import { parseRange, normalizeMetricName, isMetricAbnormal } from './utils';
import type { ReferenceRangeMap, Metric } from './types';

describe('parseRange DB fallback uses normalizeMetricName key', () => {
    it('finds a range when the map is keyed by normalizeMetricName', () => {
        const dbRanges: ReferenceRangeMap = {
            [normalizeMetricName('Glucose Fasting')]: {
                test_name: 'GLUCOSE FASTING',
                normal_min: 70,
                normal_max: 100,
            },
        };

        const result = parseRange(null, 'Glucose Fasting', dbRanges);
        expect(result).toEqual({ min: 70, max: 100 });
    });

    it('returns null when no range string and no DB match', () => {
        const result = parseRange(null, 'Unknown Test', {});
        expect(result).toBeNull();
    });

    it('parses inline range string without needing DB', () => {
        const result = parseRange('70 - 100', undefined, undefined);
        expect(result).toEqual({ min: 70, max: 100 });
    });

    it('prefers DB range over inline range string when both available', () => {
        const dbRanges: ReferenceRangeMap = {
            [normalizeMetricName('TSH')]: {
                test_name: 'TSH',
                normal_min: 0.4,
                normal_max: 4.0,
            },
        };
        // Inline says 0-100, DB says 0.4-4.0 — DB should win
        const result = parseRange('0 - 100', 'TSH', dbRanges);
        expect(result).toEqual({ min: 0.4, max: 4.0 });
    });

    it('falls back to inline range when no DB match', () => {
        const result = parseRange('70 - 100', 'Unknown Test', {});
        expect(result).toEqual({ min: 70, max: 100 });
    });
});

function makeMetric(value: string): Metric {
    return {
        id: 1,
        test_name: 'Urine Color',
        test_value: value,
        unit: null,
        ref_range: null,
        category: 'URINALYSIS',
        test_date: '2026-01-01',
    };
}

describe('isMetricAbnormal string values', () => {
    it('does not flag YELLOW as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Yellow'))).toBe(false);
    });
    it('does not flag TRACE as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Trace'))).toBe(false);
    });
    it('does not flag FEW as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Few'))).toBe(false);
    });
    it('does not flag RARE as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Rare'))).toBe(false);
    });
    it('does not flag NIL as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Nil'))).toBe(false);
    });
    it('does not flag NOT SEEN as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Not Seen'))).toBe(false);
    });
    it('does not flag OCCASIONAL as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Occasional'))).toBe(false);
    });
    it('does not flag SCANTY as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Scanty'))).toBe(false);
    });
    it('still flags POSITIVE as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Positive'))).toBe(true);
    });
    it('still flags PRESENT as abnormal', () => {
        expect(isMetricAbnormal(makeMetric('Present'))).toBe(true);
    });
});

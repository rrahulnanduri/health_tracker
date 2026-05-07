import { describe, it, expect } from 'vitest';
import { parseRange, normalizeMetricName } from './utils';
import type { ReferenceRangeMap } from './types';

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
});

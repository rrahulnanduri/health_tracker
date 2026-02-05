export interface Metric {
    id: number;
    test_name: string;
    test_value: string | number;
    unit: string | null;
    ref_range: string | null;
    category: string;
    test_date: Date | string; // Postgres returns Date, but mapped/serialized might vary if we needed to
    recorded_at?: Date | string;
    status?: string;
}

export interface ReferenceRange {
    test_name: string;
    aliases?: string[];
    unit?: string;
    category?: string;
    source?: string;
    // Generic
    optimal_min?: number;
    optimal_max?: number;
    normal_min?: number;
    normal_max?: number;
    // Gender specific
    male_normal_min?: number;
    male_normal_max?: number;
    female_normal_min?: number;
    female_normal_max?: number;
    // We can add others as needed (critical, borderline)
}

export type ReferenceRangeMap = Record<string, ReferenceRange>;

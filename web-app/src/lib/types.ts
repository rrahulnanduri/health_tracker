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

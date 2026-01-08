import sql from '$lib/server/db';
import type { Metric } from '$lib/types';

export async function load() {
    try {
        const metrics = await sql`
			SELECT 
				id,
				test_name,
				test_value,
				unit,
				ref_range,
				category,
				test_date,
				recorded_at
			FROM lab_metrics
			ORDER BY test_date DESC, test_name ASC
		`;

        const parsedMetrics: Metric[] = metrics.map((row) => {
            const originalValue = row.test_value as string;
            let parsedValue: string | number = originalValue;

            if (originalValue) {
                // Remove commas
                const cleaned = originalValue.replace(/,/g, '');
                // Simple number check
                if (!isNaN(parseFloat(cleaned)) && isFinite(Number(cleaned))) {
                    parsedValue = parseFloat(cleaned);
                }
            }

            return {
                id: row.id,
                test_name: row.test_name,
                test_value: parsedValue,
                unit: row.unit,
                ref_range: row.ref_range,
                category: row.category,
                test_date: row.test_date,
                recorded_at: row.recorded_at
            };
        });

        return {
            metrics: parsedMetrics
        };
    } catch (e) {
        console.error('Database connection error:', e);
        return {
            metrics: [],
            error: 'Unable to connect to database'
        };
    }
}

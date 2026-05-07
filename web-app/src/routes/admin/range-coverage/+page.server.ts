import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import sql from '$lib/server/db';
import { normalizeMetricName, parseRange } from '$lib/utils';
import type { ReferenceRange } from '$lib/types';

const checkSuperuser = async (locals: App.Locals) => {
    const clerkUserId = locals.session?.userId;
    if (!clerkUserId) throw error(401, 'Unauthorized');
    const result = await sql`
        SELECT role FROM auth_users WHERE clerk_id = ${clerkUserId}
    `;
    if (!result.length || result[0].role !== 'superuser') {
        throw error(403, 'Forbidden: You do not have admin access');
    }
};

interface BiomarkerInfo {
    test_name: string;
    category: string;
    sample_ref_range: string | null;
    occurrence_count: number;
}

export const load: PageServerLoad = async ({ locals }) => {
    await checkSuperuser(locals);

    try {
        // Fetch every distinct numeric biomarker the app has ingested
        const distinctMetrics = await sql<{ test_name: string; category: string; sample_ref_range: string | null; occurrence_count: number }[]>`
            SELECT
                test_name,
                category,
                MAX(ref_range) AS sample_ref_range,
                COUNT(*)::int AS occurrence_count
            FROM lab_metrics
            WHERE test_value ~ '^-?[0-9]+(\.[0-9]+)?$'
            GROUP BY test_name, category
            ORDER BY category, test_name
        `;

        // Fetch all reference ranges
        const referenceRangesResult = await sql<ReferenceRange[]>`
            SELECT * FROM reference_ranges
        `;

        // Build the same dbRanges map shape used by +page.server.ts
        const dbRanges: Record<string, ReferenceRange> = {};
        for (const range of referenceRangesResult) {
            const keys = [range.test_name, ...(range.aliases || [])];
            for (const key of keys) {
                if (key) {
                    const normalized = normalizeMetricName(key);
                    dbRanges[normalized] = range;
                    const sorted = normalized.split(/\s+/).sort().join(' ');
                    if (sorted !== normalized && !dbRanges[sorted]) {
                        dbRanges[sorted] = range;
                    }
                }
            }
        }

        // Classify every distinct biomarker
        const missing: BiomarkerInfo[] = [];   // parseRange returns null entirely
        const fragile: BiomarkerInfo[] = [];   // works only via inline ref_range, no DB entry
        const covered: BiomarkerInfo[] = [];   // DB has a range

        for (const m of distinctMetrics) {
            const dbResult = parseRange(null, m.test_name, dbRanges);
            const inlineResult = parseRange(m.sample_ref_range, undefined, undefined);

            if (dbResult) {
                covered.push(m);
            } else if (inlineResult) {
                fragile.push(m);
            } else {
                missing.push(m);
            }
        }

        return {
            missing,
            fragile,
            covered,
            totalMetrics: distinctMetrics.length,
            totalDbRanges: referenceRangesResult.length,
        };
    } catch (e: unknown) {
        console.error('Range coverage load error:', e);
        const message = e instanceof Error ? e.message : String(e);
        throw error(500, `Failed to load range coverage: ${message}`);
    }
};

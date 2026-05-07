import sql from '$lib/server/db';
import type { Metric, ReferenceRange } from '$lib/types';
import type { PageServerLoad } from './$types';
import { normalizeMetricName } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
    try {
        // Get the Clerk user ID from the session
        const clerkUserId = locals.session?.userId;

        if (!clerkUserId) {
            return {
                metrics: [],
                error: 'Not authenticated'
            };
        }

        // Look up the auth_users record to get the linked patient user_id
        const authUserResult = await sql`
            SELECT user_id, role, is_verified
            FROM auth_users
            WHERE clerk_id = ${clerkUserId}
        `;

        let authUser = authUserResult[0];

        // If no auth_users record exists, create one (first login after signup)
        if (!authUser) {
            // Get email from session claims
            const email = locals.session?.claims?.email as string | undefined;

            if (email) {
                // Insert new auth_users record
                await sql`
                    INSERT INTO auth_users (clerk_id, email, is_verified)
                    VALUES (${clerkUserId}, ${email}, false)
                    ON CONFLICT (clerk_id) DO NOTHING
                `;

                // Fetch the newly created record
                const newAuthResult = await sql`
                    SELECT user_id, role, is_verified
                    FROM auth_users
                    WHERE clerk_id = ${clerkUserId}
                `;
                authUser = newAuthResult[0];
            }

            if (!authUser) {
                return {
                    metrics: [],
                    pendingSetup: true,
                    message: 'Account setup incomplete. Please try signing out and back in.'
                };
            }
        }

        // Check if superuser - can see all data
        const isSuperuser = authUser.role === 'superuser';

        // If not superuser and no linked user_id, show pending message
        if (!isSuperuser && !authUser.user_id) {
            return {
                metrics: [],
                pendingVerification: true,
                message: 'Your account is pending verification.'
            };
        }

        // Fetch reference ranges from DB (needed by both branches)
        const referenceRangesResult = await sql<ReferenceRange[]>`
            SELECT * FROM reference_ranges
        `;

        // creating a map for faster lookup: KEY = Normalized Test Name
        const referenceRanges: Record<string, ReferenceRange> = {};
        for (const range of referenceRangesResult) {
            const keys = [range.test_name, ...(range.aliases || [])];
            for (const key of keys) {
                if (key) {
                    referenceRanges[normalizeMetricName(key)] = range;
                }
            }
        }

        if (isSuperuser) {
            const PAGE_SIZE = 50;
            let page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10));

            const [countResult] = await sql`SELECT COUNT(*)::int AS total FROM lab_metrics`;
            const totalCount: number = countResult.total;
            const totalPages = Math.ceil(totalCount / PAGE_SIZE);

            // Clamp page to valid range
            page = Math.min(page, Math.max(1, totalPages));

            const offset = (page - 1) * PAGE_SIZE;

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
                LIMIT ${PAGE_SIZE} OFFSET ${offset}
            `;

            const parsedMetrics = metrics.map((row) => {
                const originalValue = row.test_value as string;
                let parsedValue: string | number = originalValue;
                if (originalValue) {
                    const cleaned = originalValue.replace(/,/g, '');
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
                metrics: parsedMetrics,
                isSuperuser,
                referenceRanges,
                pagination: {
                    page,
                    pageSize: PAGE_SIZE,
                    totalCount,
                    totalPages: Math.ceil(totalCount / PAGE_SIZE),
                },
            };
        }

        // Regular user sees only their data
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
            WHERE user_id = ${authUser.user_id}
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
            metrics: parsedMetrics,
            isSuperuser,
            referenceRanges
        };
    } catch (e: any) {
        console.error('Database connection error:', e);
        return {
            metrics: [],
            referenceRanges: {},
            error: `Unable to connect: ${e.message || e}`
        };
    }
};

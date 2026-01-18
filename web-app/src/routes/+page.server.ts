import sql from '$lib/server/db';
import type { Metric } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
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

        // Build the query based on role
        let metrics;
        if (isSuperuser) {
            // Superuser sees ALL data
            metrics = await sql`
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
        } else {
            // Regular user sees only their data
            metrics = await sql`
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
        }

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
            isSuperuser
        };
    } catch (e) {
        console.error('Database connection error:', e);
        return {
            metrics: [],
            error: 'Unable to connect to database'
        };
    }
};

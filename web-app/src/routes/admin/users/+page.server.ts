import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import sql from '$lib/server/db';

// Ensure only superusers can access this page
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

export const load: PageServerLoad = async ({ locals }) => {
    await checkSuperuser(locals);

    try {
        // Fetch all Clerk users (auth_users)
        const authUsers = await sql`
            SELECT 
                au.id, 
                au.clerk_id, 
                au.email, 
                au.user_id, 
                au.role, 
                au.is_verified, 
                au.created_at,
                u.name as patient_name
            FROM auth_users au
            LEFT JOIN users u ON au.user_id = u.id
            ORDER BY au.created_at DESC
        `;

        // Fetch all available patients (for dropdown)
        const patients = await sql`
            SELECT id, name, created_at 
            FROM users 
            ORDER BY name ASC
        `;

        return {
            authUsers,
            patients
        };
    } catch (e) {
        console.error('Admin load error:', e);
        throw error(500, 'Failed to load admin data');
    }
};

export const actions: Actions = {
    // Link an auth_user to an existing patient ID
    link: async ({ request, locals }) => {
        await checkSuperuser(locals);
        const data = await request.formData();
        const authUsersId = data.get('auth_users_id');
        const userId = data.get('user_id');

        if (!authUsersId || !userId) {
            return fail(400, { missing: true });
        }

        try {
            await sql`
                UPDATE auth_users 
                SET user_id = ${userId.toString()}, is_verified = true 
                WHERE id = ${authUsersId.toString()}
            `;
            return { success: true };
        } catch (e) {
            console.error('Link error:', e);
            return fail(500, { dbError: true });
        }
    },

    // Create a NEW patient record and link to auth_user
    create_and_link: async ({ request, locals }) => {
        await checkSuperuser(locals);
        const data = await request.formData();
        const authUsersId = data.get('auth_users_id');
        const patientName = data.get('patient_name');

        if (!authUsersId || !patientName) {
            return fail(400, { missing: true });
        }

        try {
            // Transaction-like approach (though postgres.js does transactions differently, sequential works for now)
            // 1. Create user
            const newUser = await sql`
                INSERT INTO users (name, age, gender) 
                VALUES (${patientName.toString()}, 0, 'UNKNOWN') 
                RETURNING id
            `;
            const newUserId = newUser[0].id;

            // 2. Link auth_user
            await sql`
                UPDATE auth_users 
                SET user_id = ${newUserId}, is_verified = true 
                WHERE id = ${authUsersId.toString()}
            `;

            return { success: true };
        } catch (e) {
            console.error('Create and link error:', e);
            return fail(500, { dbError: true });
        }
    },

    // Unlink a user
    unlink: async ({ request, locals }) => {
        await checkSuperuser(locals);
        const data = await request.formData();
        const authUsersId = data.get('auth_users_id');

        if (!authUsersId) return fail(400, { missing: true });

        try {
            await sql`
                UPDATE auth_users 
                SET user_id = NULL, is_verified = false 
                WHERE id = ${authUsersId.toString()}
            `;
            return { success: true };
        } catch (e) {
            console.error('Unlink error:', e);
            return fail(500, { dbError: true });
        }
    }
};

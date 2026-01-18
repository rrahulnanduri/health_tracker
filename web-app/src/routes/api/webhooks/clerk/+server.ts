import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Webhook } from 'svix';
import { CLERK_WEBHOOK_SECRET } from '$env/static/private';
import sql from '$lib/server/db';

// Clerk webhook handler
// Handles user lifecycle events (created, updated, deleted)
// 
// Setup in Clerk Dashboard:
// 1. Go to Configure → Webhooks → Add Endpoint
// 2. URL: https://your-domain.com/api/webhooks/clerk
// 3. Subscribe to: user.created, user.updated, user.deleted
// 4. Copy the Signing Secret to CLERK_WEBHOOK_SECRET in .env

interface ClerkUserEvent {
    data: {
        id: string;
        email_addresses: Array<{
            email_address: string;
            id: string;
        }>;
        primary_email_address_id: string;
        deleted?: boolean;
    };
    type: string;
}

export const POST: RequestHandler = async ({ request }) => {
    const payload = await request.text();
    const headers = {
        'svix-id': request.headers.get('svix-id') ?? '',
        'svix-timestamp': request.headers.get('svix-timestamp') ?? '',
        'svix-signature': request.headers.get('svix-signature') ?? ''
    };

    // Verify webhook signature
    if (!CLERK_WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET is not set');
        throw error(500, 'Webhook secret not configured');
    }

    let event: ClerkUserEvent;
    try {
        const wh = new Webhook(CLERK_WEBHOOK_SECRET);
        event = wh.verify(payload, headers) as ClerkUserEvent;
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        throw error(400, 'Invalid webhook signature');
    }

    const eventType = event.type;
    const userId = event.data.id;

    console.log(`[Webhook] Received ${eventType} for user ${userId}`);

    try {
        switch (eventType) {
            case 'user.created': {
                // Get primary email
                const primaryEmailId = event.data.primary_email_address_id;
                const emailObj = event.data.email_addresses.find(
                    e => e.id === primaryEmailId
                );
                const email = emailObj?.email_address;

                if (email) {
                    // Create auth_users record if it doesn't exist
                    await sql`
                        INSERT INTO auth_users (clerk_id, email, is_verified)
                        VALUES (${userId}, ${email}, false)
                        ON CONFLICT (clerk_id) DO UPDATE SET email = ${email}
                    `;
                    console.log(`[Webhook] Created auth_users record for ${email}`);
                }
                break;
            }

            case 'user.updated': {
                // Update email if changed
                const primaryEmailId = event.data.primary_email_address_id;
                const emailObj = event.data.email_addresses.find(
                    e => e.id === primaryEmailId
                );
                const email = emailObj?.email_address;

                if (email) {
                    await sql`
                        UPDATE auth_users 
                        SET email = ${email}
                        WHERE clerk_id = ${userId}
                    `;
                    console.log(`[Webhook] Updated email for ${userId}`);
                }
                break;
            }

            case 'user.deleted': {
                // Remove user from auth_users (revoke access)
                await sql`
                    DELETE FROM auth_users 
                    WHERE clerk_id = ${userId}
                `;
                console.log(`[Webhook] Deleted auth_users record for ${userId}`);
                break;
            }

            default:
                console.log(`[Webhook] Unhandled event type: ${eventType}`);
        }

        return json({ received: true });
    } catch (err) {
        console.error(`[Webhook] Database error:`, err);
        throw error(500, 'Database error');
    }
};

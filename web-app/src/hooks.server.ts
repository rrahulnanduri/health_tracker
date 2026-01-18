import { handleClerk } from 'clerk-sveltekit/server';
import { CLERK_SECRET_KEY } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// Clerk authentication handler
const clerkHandle = handleClerk(CLERK_SECRET_KEY, {
    debug: false,
    protectedPaths: ['/'],  // Protect the main page
    signInUrl: '/sign-in'
});

// Custom handler to allow public routes
const publicRoutesHandle: Handle = async ({ event, resolve }) => {
    const publicPaths = ['/sign-in', '/sign-up', '/api/webhooks'];
    const isPublicPath = publicPaths.some(path => event.url.pathname.startsWith(path));

    if (isPublicPath) {
        return resolve(event);
    }

    return clerkHandle({ event, resolve });
};

export const handle: Handle = sequence(publicRoutesHandle);

import { handleClerk } from 'clerk-sveltekit/server';
import { CLERK_SECRET_KEY } from '$env/static/private';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

// Rate limiter for auth endpoints - prevents brute force and credential stuffing
const authLimiter = new RetryAfterRateLimiter({
    IP: [10, 'm'],      // 10 requests per minute per IP
    IPUA: [5, 'm']      // 5 requests per minute per IP + User Agent
});

// Rate limiter for general API - more permissive
const apiLimiter = new RetryAfterRateLimiter({
    IP: [60, 'm'],      // 60 requests per minute per IP
    IPUA: [30, 'm']     // 30 requests per minute per IP + User Agent
});

// Clerk authentication handler
const clerkHandle = handleClerk(CLERK_SECRET_KEY, {
    debug: false,
    protectedPaths: ['/'],
    signInUrl: '/sign-in'
});

// Rate limiting handler
const rateLimitHandle: Handle = async ({ event, resolve }) => {
    const path = event.url.pathname;

    // Apply stricter rate limiting to auth endpoints
    if (path.startsWith('/sign-in') || path.startsWith('/sign-up')) {
        const status = await authLimiter.check(event);
        if (status.limited) {
            return new Response(
                JSON.stringify({
                    error: 'Too many requests. Please try again later.',
                    retryAfter: status.retryAfter
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': status.retryAfter.toString()
                    }
                }
            );
        }
    }

    // Apply general rate limiting to API endpoints
    if (path.startsWith('/api/')) {
        const status = await apiLimiter.check(event);
        if (status.limited) {
            return new Response(
                JSON.stringify({
                    error: 'Rate limit exceeded',
                    retryAfter: status.retryAfter
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': status.retryAfter.toString()
                    }
                }
            );
        }
    }

    return resolve(event);
};

// Security headers handler
const securityHeadersHandle: Handle = async ({ event, resolve }) => {
    const response = await resolve(event, {
        transformPageChunk: ({ html }) => html,
        filterSerializedResponseHeaders: () => true
    });

    // Clone the response to make headers mutable
    const newHeaders = new Headers(response.headers);

    // Add security headers
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // CSP - allow Clerk domains
    newHeaders.set('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.com https://*.clerk.accounts.dev; " +
        "style-src 'self' 'unsafe-inline' https://*.clerk.com; " +
        "img-src 'self' data: https://*.clerk.com https://*.gravatar.com https://*.googleusercontent.com; " +
        "font-src 'self' https://*.clerk.com; " +
        "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev; " +
        "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev;"
    );

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
};

// Custom handler to allow public routes
const publicRoutesHandle: Handle = async ({ event, resolve }) => {
    const publicPaths = ['/sign-in', '/sign-up', '/api/webhooks'];
    const isPublicPath = publicPaths.some(path => event.url.pathname.startsWith(path));

    if (isPublicPath) {
        return resolve(event);
    }

    return clerkHandle({ event, resolve });
};

// Combine all handlers: rate limit → security headers → auth
export const handle: Handle = sequence(
    rateLimitHandle,
    securityHeadersHandle,
    publicRoutesHandle
);

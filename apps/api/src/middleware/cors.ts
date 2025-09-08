import {cors} from 'hono/cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()) || [];

export const corsMiddleware = cors({
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Idempotency-Key'],
    credentials: true,
    maxAge: 86400,
    origin: origin => {
        // allow all origins in development if * is specified
        if (allowedOrigins.includes('*')) {
            console.warn('CORS: Allowing all origins (*) - not recommended for production');
            return origin;
        }

        const isAllowed = allowedOrigins.includes(origin);
        if (!isAllowed && origin) {
            console.warn(`CORS: Blocked request from origin: ${origin}`);
        }

        return isAllowed ? origin : null;
    }
});

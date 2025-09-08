import type {Context, Next} from 'hono';
import pino from 'pino';

const logger = pino({level: process.env.LOG_LEVEL || 'info'});

export const loggingMiddleware = async (c: Context, next: Next) => {
    const start = Date.now();
    const method = c.req.method;
    const path = c.req.path;

    const clientIp =
        c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
        c.req.header('cf-connecting-ip') ||
        c.req.header('x-real-ip') ||
        'unknown';

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    logger.info({
        method,
        path,
        status,
        duration,
        clientIp
    });
};

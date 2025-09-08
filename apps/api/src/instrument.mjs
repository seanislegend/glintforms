import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enableLogs: true,
    profilesSampleRate: 1.0,
    sendDefaultPii: true,
    tracesSampleRate: 1.0
});

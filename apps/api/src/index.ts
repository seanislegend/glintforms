import './instrument';

import {Hono} from 'hono';
import {secureHeaders} from 'hono/secure-headers';
import 'dotenv/config';
import {DEFAULT_LOCALE, LOCALES} from '@glint/translations/constants';
import {languageDetector} from 'hono/language';
import {logger} from 'hono/logger';
import type {ServerContext} from 'src/types/server.js';
import {corsMiddleware} from './middleware/cors.js';
import {errorMiddleware} from './middleware/errors.js';
import {loggingMiddleware} from './middleware/logging.js';
import {securityMiddleware} from './middleware/security.js';
import surveysRouter from './routes/surveys.js';

const app = new Hono<ServerContext>().basePath('/v1');

app.onError(errorMiddleware);

app.use(
    languageDetector({
        supportedLanguages: LOCALES,
        fallbackLanguage: DEFAULT_LOCALE
    })
);
app.use(logger());
app.use(secureHeaders());
app.use('*', securityMiddleware);
app.use('*', corsMiddleware);
app.use('*', loggingMiddleware);

app.route('/surveys', surveysRouter);
app.get('/health', c => c.json({ok: true}));

const port = Number(process.env.PORT ?? 8787);
console.log(`API listening on http://localhost:${port}`);

export default {
    fetch: app.fetch,
    port
};

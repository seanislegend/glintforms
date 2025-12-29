import {randomBytes} from 'node:crypto';
import {
    db,
    type questions,
    responses,
    screeners,
    surveyScreeners,
    surveySettings,
    surveys
} from '@glint/database';
import {decrypt} from '@glint/encryption';
import {Redis} from '@upstash/redis';
import {asc, count, eq} from 'drizzle-orm';
import type {Context, MiddlewareHandler} from 'hono';
import {
    SurveyAuthenticationError,
    SurveyClosedError,
    SurveyNotFoundError
} from '@/middleware/errors.js';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export const createSurveyResponse = (
    survey: Survey,
    settings: SurveySettings = {},
    questions: Question[] = [],
    responseCount?: number,
    screeners: Array<{
        config: Record<string, unknown>;
        id: string;
        options?: Array<{id: string; label: string}>;
        question?: string;
        type: 'age' | 'location' | 'selection';
    }> = []
): Omit<Survey, 'hasResponses' | 'status' | 'tenantId'> & {screeners?: typeof screeners} => {
    const baseData = {
        description: survey.description ?? '',
        id: survey.id,
        slug: survey.slug,
        title: survey.title
    };
    const hasExceededMaxResponses =
        settings?.maxResponses && responseCount && responseCount >= settings.maxResponses;
    const data = {
        ...baseData,
        allowAnonymous: settings?.allowAnonymous || false,
        campaignId: survey.campaignId,
        closedText: settings?.closedText || '',
        isClosed: survey.status !== 'active' || !!hasExceededMaxResponses,
        isPasswordProtected: settings?.isPasswordProtected || false,
        questions,
        ...(screeners.length > 0 ? {screeners} : {})
    };

    return data;
};

export const findSurveyByIdOrSlug = async (idOrSlug: string) => {
    const [byId] = await db.select().from(surveys).where(eq(surveys.id, idOrSlug)).limit(1);
    if (byId) return byId;

    const [bySlug] = await db.select().from(surveys).where(eq(surveys.slug, idOrSlug)).limit(1);
    if (bySlug) return bySlug;

    return null;
};

export const getResponseCount = async (surveyId: string) => {
    const [result] = await db
        .select({count: count()})
        .from(responses)
        .where(eq(responses.surveyId, surveyId));
    return result?.count || 0;
};

export const transformQuestion = (question: typeof questions.$inferSelect) => {
    const data: Question = {
        id: question.id,
        required: question.required,
        title: question.title,
        type: question.type,
        validations: ((question?.validations || []) as any[])
            .filter((v: any) => v.enabled)
            .map((v: any) => ({type: v.type, value: v.value}))
    };

    if (question.type === 'single_select' || question.type === 'multi_select') {
        const options = question.options as Array<{id: string; value: string}>;
        data.options = options.map(option => ({
            label: option.value,
            value: option.id
        }));
        data.allowOther = question.allowOther;
        data.randomiseOptionsOrder = question.randomiseOptionsOrder;
    }

    return data;
};

export const verifySurveyIsActive: MiddlewareHandler = async (
    c: Context,
    next: () => Promise<void>
) => {
    const method = c.req.method;
    const survey = await findSurveyByIdOrSlug(c.req.param('idOrSlug'));

    if (!survey) {
        throw new SurveyNotFoundError();
    }

    if (!['active', 'testing'].includes(survey.status)) {
        // for get, intended for showing the user the survey, we want nice feedback when
        // the survey is closed. for posts, we want to throw an error.
        if (method === 'GET') {
            return c.json(createSurveyResponse(survey));
        }

        throw new SurveyClosedError();
    }

    const [settings] = await db
        .select()
        .from(surveySettings)
        .where(eq(surveySettings.surveyId, survey.id));

    c.set('survey', survey);
    c.set('settings', settings);

    if (settings?.maxResponses) {
        const responseCount = await getResponseCount(survey.id);

        if (responseCount >= settings.maxResponses) {
            // for get, intended for showing the user the survey, we want nice feedback when
            // the survey is closed. for posts, we want to throw an error.
            if (method === 'GET') {
                return c.json(createSurveyResponse(survey, settings, [], responseCount));
            } else {
                throw new SurveyClosedError();
            }
        }

        c.set('responseCount', responseCount);
    }

    await next();
};

export const verifySurveyPassword: MiddlewareHandler = async (
    c: Context,
    next: () => Promise<void>
) => {
    const settings = c.get('settings');

    if (settings?.isPasswordProtected) {
        const headerPassword = c.req.header('x-password') ?? '';
        if (!headerPassword) throw new SurveyAuthenticationError();

        try {
            const decryptedStoredPassword = decrypt(settings.password ?? '');
            if (headerPassword !== decryptedStoredPassword) {
                throw new SurveyAuthenticationError();
            }
        } catch {
            throw new SurveyAuthenticationError();
        }
    }

    await next();
};

export const verifyIdempotency: MiddlewareHandler = async (
    c: Context,
    next: () => Promise<void>
) => {
    const idemKey = c.req.header('idempotency-key');

    if (idemKey) {
        const hasAlreadyProcessed = await redis.get(idemKey);
        if (hasAlreadyProcessed) {
            return c.json({ok: true, idempotent: true}, 200);
        } else {
            await redis.set(idemKey, '1');
            await redis.expire(idemKey, 60 * 60); // 1 hour
        }
    }

    await next();
};

// screener validation helpers
export const validateAgeScreener = (
    age: number | null | undefined,
    config: {operator: 'over' | 'under'; value: number}
): boolean => {
    if (age === null || age === undefined) return false;

    if (config.operator === 'over') {
        return age > config.value;
    } else {
        return age < config.value;
    }
};

export const validateLocationScreener = (
    country: string | null | undefined,
    config: {countries: string[]}
): boolean => {
    if (!country) return false;
    return config.countries.includes(country);
};

export const validateSelectionScreener = (
    optionId: string | null | undefined,
    config: {options: Array<{id: string; passes: boolean}>}
): boolean => {
    if (!optionId) return false;
    const option = config.options.find(opt => opt.id === optionId);
    return option?.passes ?? false;
};

export const getSurveyScreeners = async (surveyId: string) => {
    const rows = await db
        .select({
            config: screeners.config,
            failureMessage: surveyScreeners.failureMessage,
            id: screeners.id,
            order: surveyScreeners.order,
            type: screeners.type
        })
        .from(surveyScreeners)
        .innerJoin(screeners, eq(surveyScreeners.screenerId, screeners.id))
        .where(eq(surveyScreeners.surveyId, surveyId))
        .orderBy(asc(surveyScreeners.order));

    return rows;
};

export const transformScreener = (screener: {config: unknown; id: string; type: string}) => {
    const base = {
        config: screener.config as Record<string, unknown>,
        id: screener.id,
        type: screener.type as 'age' | 'location' | 'selection'
    };

    if (screener.type === 'selection') {
        const config = screener.config as {
            options: Array<{id: string; passes: boolean; value: string}>;
            question: string;
        };
        return {
            ...base,
            options: config.options.map(opt => ({id: opt.id, label: opt.value})),
            question: config.question
        };
    }

    return base;
};

// screener token utilities
export const generateScreenerToken = (): string => {
    return randomBytes(32).toString('hex');
};

export const storeScreenerToken = async (surveyId: string, token: string): Promise<void> => {
    const key = `screener:token:${surveyId}:${token}`;
    await redis.set(key, surveyId);
    await redis.expire(key, 3600); // 1 hour
};

export const verifyScreenerToken = async (
    surveyId: string,
    token: string | null | undefined
): Promise<boolean> => {
    if (!token) return false;

    const key = `screener:token:${surveyId}:${token}`;
    const storedSurveyId = await redis.get<string>(key);

    return storedSurveyId === surveyId;
};

export const verifyScreenerTokenMiddleware: MiddlewareHandler = async (
    c: Context,
    next: () => Promise<void>
) => {
    const survey = c.get('survey');
    const token = c.req.header('x-screener-token');

    const isValid = await verifyScreenerToken(survey.id, token);
    if (!isValid) {
        throw new SurveyAuthenticationError();
    }

    await next();
};

export const verifyScreenerTokenIfRequired: MiddlewareHandler = async (
    c: Context,
    next: () => Promise<void>
) => {
    const survey = c.get('survey');
    const screenerRows = await getSurveyScreeners(survey.id);

    if (screenerRows.length > 0) {
        const token = c.req.header('x-screener-token');
        const isValid = await verifyScreenerToken(survey.id, token);
        if (!isValid) {
            throw new SurveyAuthenticationError();
        }
    }

    await next();
};

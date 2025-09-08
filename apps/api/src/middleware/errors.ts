import type {Context} from 'hono';

export class SurveyNotFoundError extends Error {
    constructor() {
        super('SURVEY_NOT_FOUND');
        this.name = 'SurveyNotFoundError';
    }
}

export class SurveyClosedError extends Error {
    constructor() {
        super('SURVEY_CLOSED');
        this.name = 'SurveyClosedError';
    }
}

export class InvalidBodyError extends Error {
    constructor() {
        super('INVALID_BODY');
        this.name = 'InvalidBodyError';
    }
}

export class SurveyAuthenticationError extends Error {
    constructor() {
        super('SURVEY_AUTHENTICATION_ERROR');
        this.name = 'SurveyAuthenticationError';
    }
}

export const errorMiddleware = async (err: Error, c: Context) => {
    if (err instanceof SurveyNotFoundError) {
        return c.json({error: 'not_found'}, 404);
    } else if (err instanceof SurveyClosedError) {
        return c.json({error: 'closed'}, 403);
    } else if (err instanceof InvalidBodyError) {
        return c.json({error: 'invalid_body'}, 400);
    } else if (err instanceof SurveyAuthenticationError) {
        return c.json({error: 'authentication_required'}, 401);
    }

    if (err instanceof Error && err.message.includes('validation')) {
        return c.json({error: 'validation_error', message: err.message}, 400);
    } else if (err instanceof SyntaxError) {
        return c.json({error: 'invalid_json'}, 400);
    }

    return c.json({error: 'internal_server_error'}, 500);
};

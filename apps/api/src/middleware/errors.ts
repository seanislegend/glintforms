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
    issues?: unknown;

    constructor(issues?: unknown) {
        super('INVALID_BODY');
        this.name = 'InvalidBodyError';
        this.issues = issues;
    }
}

export class SurveyAuthenticationError extends Error {
    constructor() {
        super('SURVEY_AUTHENTICATION_ERROR');
        this.name = 'SurveyAuthenticationError';
    }
}

export const errorMiddleware = async (err: Error, c: Context) => {
    console.log(err);

    if (err instanceof SurveyNotFoundError) {
        return c.json({error: 'not_found'}, 404);
    } else if (err instanceof SurveyClosedError) {
        return c.json({error: 'closed'}, 403);
    } else if (err instanceof InvalidBodyError) {
        const response: {error: string; issues?: unknown} = {error: 'invalid_body'};
        if (err.issues) {
            response.issues = err.issues;
        }
        return c.json(response, 400);
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

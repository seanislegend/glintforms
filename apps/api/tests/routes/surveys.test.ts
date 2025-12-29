/** biome-ignore-all lint/style/noNonNullAssertion: tests */

import {Hono} from 'hono';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {errorMiddleware} from '../../src/middleware/errors.js';
import router from '../../src/routes/surveys.js';
import {mockQuestionAnswersList, mockQuestionsList} from '../mocks/questions.js';
import {
    mockAgeScreener,
    mockLocationScreener,
    mockScreenersList,
    mockSingleChoiceScreener
} from '../mocks/screeners.js';
import {mockSurvey, mockSurveySettings, mockSurveySettingsWithPassword} from '../mocks/survey.js';
import {mockRedis} from '../setup.js';

vi.mock('@glint/database', () => ({
    db: {select: vi.fn(), insert: vi.fn(), update: vi.fn(), transaction: vi.fn()},
    answers: {},
    questions: {},
    responseSubmissions: {},
    responses: {},
    screeners: {},
    surveyScreeners: {},
    surveys: {},
    surveySettings: {}
}));

vi.mock('@glint/encryption', () => ({
    decrypt: vi.fn((encryptedPassword: string) => {
        if (encryptedPassword === 'dummy-encrypted-password') {
            return 'secret123';
        }
        throw new Error('Invalid encrypted password');
    }),
    encrypt: vi.fn((password: string) => `encrypted-${password}`)
}));

vi.mock('@trigger.dev/sdk', () => ({
    tasks: {
        trigger: vi.fn().mockResolvedValue(undefined)
    }
}));

// helper functions for simplified mocking
const createMockDbSelect = (returnValue: any) =>
    ({
        from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue(returnValue)
                })
            }),
            where: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(returnValue),
                orderBy: vi.fn().mockResolvedValue(returnValue)
            })
        })
    }) as any;

const createMockDbSelectSimple = (returnValue: any) =>
    ({
        from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(returnValue)
        })
    }) as any;

const createMockDbTransaction = (success = true) => {
    if (success) {
        return vi.fn().mockResolvedValue(undefined);
    }
    return vi.fn().mockRejectedValue(new Error('Database error'));
};

const setupSurveyMocks = (options: {
    screeners?: typeof mockScreenersList;
    survey?: typeof mockSurvey | null;
    settings?: typeof mockSurveySettings;
    responseCount?: number;
    questions?: typeof mockQuestionsList;
    transactionSuccess?: boolean;
}) => {
    const mockDbSelect = vi.mocked(db.select);
    const mockDbTransaction = vi.mocked(db.transaction);

    // survey lookup - for findSurveyByIdOrSlug, we need to mock both ID and slug queries
    const surveyToReturn = options.survey === null ? [] : [options.survey || mockSurvey];
    mockDbSelect.mockReturnValueOnce(createMockDbSelect(surveyToReturn));
    if (options.survey === null) {
        // if survey is null, we need to mock the second query (by slug) as well
        mockDbSelect.mockReturnValueOnce(createMockDbSelect([]));
    }
    // settings lookup
    mockDbSelect.mockReturnValueOnce(
        createMockDbSelectSimple([options.settings || mockSurveySettings])
    );
    // response count
    mockDbSelect.mockReturnValueOnce(
        createMockDbSelectSimple([{count: options.responseCount || 5}])
    );
    // screeners lookup (if provided) - uses innerJoin
    if (options.screeners !== undefined) {
        const screenerQuery = {
            from: vi.fn().mockReturnValue({
                innerJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockResolvedValue(options.screeners)
                    })
                })
            })
        } as any;
        mockDbSelect.mockReturnValueOnce(screenerQuery);
    }
    // questions lookup (only if survey is open)
    if (options.questions !== undefined) {
        mockDbSelect.mockReturnValueOnce(createMockDbSelect(options.questions));
    }
    // transaction
    if (options.transactionSuccess !== undefined) {
        mockDbTransaction.mockImplementation(createMockDbTransaction(options.transactionSuccess));
    }

    return {mockDbSelect, mockDbTransaction};
};

const mockScenarios = {
    // GET scenarios
    openSurvey: () => setupSurveyMocks({questions: mockQuestionsList, screeners: []}),
    closedSurvey: () => setupSurveyMocks({responseCount: 100, screeners: []}),
    surveyNotFound: () => setupSurveyMocks({survey: null}),
    closedSurveyNoText: () =>
        setupSurveyMocks({
            screeners: [],
            settings: {...mockSurveySettings, closedText: null as any},
            responseCount: 100
        }),
    passwordProtected: () =>
        setupSurveyMocks({
            screeners: [],
            settings: {
                ...mockSurveySettings,
                isPasswordProtected: true,
                password: 'dummy-encrypted-password' as any
            },
            responseCount: 5,
            questions: mockQuestionsList
        }),
    anonymousAccess: () =>
        setupSurveyMocks({
            screeners: [],
            settings: {...mockSurveySettings, allowAnonymous: true},
            responseCount: 5,
            questions: mockQuestionsList
        }),
    maxResponsesReached: () =>
        setupSurveyMocks({
            screeners: [],
            settings: {...mockSurveySettings, maxResponses: 50},
            responseCount: 50
        }),
    // POST scenarios
    successfulResponse: () =>
        setupSurveyMocks({
            questions: mockQuestionsList,
            responseCount: 5,
            screeners: [],
            transactionSuccess: true
        }),
    transactionError: () => {
        setupSurveyMocks({
            questions: mockQuestionsList,
            responseCount: 5,
            screeners: [],
            transactionSuccess: false
        });
        // make insert fail to simulate database error
        vi.mocked(db.insert).mockImplementationOnce(() => {
            const returningFn = vi.fn().mockRejectedValue(new Error('Database error'));
            const valuesFn = vi.fn().mockReturnValue({returning: returningFn});
            return {values: valuesFn} as any;
        });
    },
    surveyClosed: () =>
        setupSurveyMocks({
            responseCount: 100
        }),
    inactiveSurvey: () =>
        setupSurveyMocks({
            survey: {...mockSurvey, status: 'draft'},
            responseCount: 5
        }),
    archivedSurvey: () =>
        setupSurveyMocks({
            survey: {...mockSurvey, status: 'archived'},
            responseCount: 5
        }),
    idempotencyKeyExists: () =>
        setupSurveyMocks({
            questions: mockQuestionsList,
            responseCount: 5,
            screeners: [],
            transactionSuccess: true
        })
};

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((field, value) => ({field, value})),
    asc: vi.fn(field => ({field, direction: 'asc'})),
    count: vi.fn(() => 'count')
}));

// import mocked modules
import {db} from '@glint/database';

// setup mock for db.insert - accepts table parameter and returns chainable object
vi.mocked(db.insert).mockImplementation(() => {
    const returningFn = vi.fn().mockResolvedValue([{id: 'mock-submission-id'}]);
    const valuesFn = vi.fn().mockReturnValue({returning: returningFn});
    return {values: valuesFn} as any;
});

// create a test app with error middleware
const app = new Hono();
app.onError(errorMiddleware);
app.route('/surveys', router);

describe('Survey Routes', () => {
    beforeEach(() => {
        // reset redis mock for each test
        mockRedis.get.mockClear();
        mockRedis.set.mockClear();
        // reset database mocks for each test
        vi.mocked(db.select).mockClear();
        vi.mocked(db.insert).mockClear();
        vi.mocked(db.transaction).mockClear();
        // set default return value for db.select to prevent undefined errors
        vi.mocked(db.select).mockReturnValue(createMockDbSelect([]));
        // reset db.insert mock implementation
        vi.mocked(db.insert).mockImplementation(() => {
            const returningFn = vi.fn().mockResolvedValue([{id: 'mock-submission-id'}]);
            const valuesFn = vi.fn().mockReturnValue({returning: returningFn});
            return {values: valuesFn} as any;
        });
    });

    describe('GET /:idOrSlug', () => {
        it('returns survey with questions when open', async () => {
            mockScenarios.openSurvey();

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: mockSurveySettings.allowAnonymous,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: mockSurvey.isClosed,
                    questions: [
                        mockQuestionsList[0]!,
                        mockQuestionsList[1]!,
                        {
                            ...mockQuestionsList[2]!,
                            options: mockQuestionsList[2]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        },
                        {
                            ...mockQuestionsList[3]!,
                            options: mockQuestionsList[3]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        }
                    ],
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
        });

        it('returns survey with closedText when closed', async () => {
            mockScenarios.closedSurvey();

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: mockSurveySettings.allowAnonymous,
                    closedText: mockSurveySettings.closedText,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: true,
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
        });

        it('throws SurveyNotFoundError when survey not found', async () => {
            mockScenarios.surveyNotFound();

            const res = await app.request(`/surveys/non-existent-id`);
            expect(res.status).toBe(404);

            const data = await res.json();
            expect(data).toEqual({error: 'not_found'});
        });

        it('returns survey with password protection enabled', async () => {
            mockScenarios.passwordProtected();

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: mockSurveySettingsWithPassword.allowAnonymous,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: mockSurvey.isClosed,
                    isPasswordProtected: true,
                    questions: [
                        mockQuestionsList[0]!,
                        mockQuestionsList[1]!,
                        {
                            ...mockQuestionsList[2]!,
                            options: mockQuestionsList[2]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        },
                        {
                            ...mockQuestionsList[3]!,
                            options: mockQuestionsList[3]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        }
                    ],
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
        });

        it('finds survey by slug when ID not found', async () => {
            // mock scenario where survey is not found by ID but found by slug
            const mockDbSelect = vi.mocked(db.select);

            // first query (by ID) returns empty
            mockDbSelect.mockReturnValueOnce(createMockDbSelect([]));
            // second query (by slug) returns the survey
            mockDbSelect.mockReturnValueOnce(createMockDbSelect([mockSurvey]));
            // settings lookup
            mockDbSelect.mockReturnValueOnce(createMockDbSelectSimple([mockSurveySettings]));
            // response count
            mockDbSelect.mockReturnValueOnce(createMockDbSelectSimple([{count: 5}]));
            // screeners lookup
            const screenerQuery = {
                from: vi.fn().mockReturnValue({
                    innerJoin: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            orderBy: vi.fn().mockResolvedValue([])
                        })
                    })
                })
            } as any;
            mockDbSelect.mockReturnValueOnce(screenerQuery);
            // questions lookup
            mockDbSelect.mockReturnValueOnce(createMockDbSelect(mockQuestionsList));

            const res = await app.request(`/surveys/${mockSurvey.slug}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    id: mockSurvey.id,
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
        });

        it('returns survey with anonymous access enabled', async () => {
            mockScenarios.anonymousAccess();

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: true,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: mockSurvey.isClosed,
                    questions: [
                        mockQuestionsList[0]!,
                        mockQuestionsList[1]!,
                        {
                            ...mockQuestionsList[2]!,
                            options: mockQuestionsList[2]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        },
                        {
                            ...mockQuestionsList[3]!,
                            options: mockQuestionsList[3]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        }
                    ],
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
        });

        it('returns survey with closed text when maxResponses limit reached', async () => {
            mockScenarios.maxResponsesReached();

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: mockSurveySettings.allowAnonymous,
                    closedText: mockSurveySettings.closedText,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: true,
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
        });

        it('returns survey with screeners but no questions when token is missing', async () => {
            setupSurveyMocks({screeners: mockScreenersList, questions: mockQuestionsList});

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: mockSurveySettings.allowAnonymous,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: mockSurvey.isClosed,
                    screeners: [
                        {
                            config: mockAgeScreener.config,
                            id: mockAgeScreener.id,
                            type: mockAgeScreener.type
                        },
                        {
                            config: mockLocationScreener.config,
                            id: mockLocationScreener.id,
                            type: mockLocationScreener.type
                        },
                        {
                            config: mockSingleChoiceScreener.config,
                            id: mockSingleChoiceScreener.id,
                            options: mockSingleChoiceScreener.config.options.map(opt => ({
                                id: opt.id,
                                label: opt.value
                            })),
                            question: mockSingleChoiceScreener.config.question,
                            type: mockSingleChoiceScreener.type
                        }
                    ],
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );
            expect(data.questions).toBeUndefined();
        });

        it('returns survey with questions when valid token is provided', async () => {
            setupSurveyMocks({screeners: mockScreenersList, questions: mockQuestionsList});

            const token = 'valid-token-123';
            mockRedis.get.mockResolvedValueOnce(mockSurvey.id);

            const res = await app.request(`/surveys/${mockSurvey.id}`, {
                headers: {'x-screener-token': token}
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual(
                expect.objectContaining({
                    allowAnonymous: mockSurveySettings.allowAnonymous,
                    description: mockSurvey.description,
                    id: mockSurvey.id,
                    isClosed: mockSurvey.isClosed,
                    questions: [
                        mockQuestionsList[0]!,
                        mockQuestionsList[1]!,
                        {
                            ...mockQuestionsList[2]!,
                            options: mockQuestionsList[2]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        },
                        {
                            ...mockQuestionsList[3]!,
                            options: mockQuestionsList[3]!.options!.map(option => ({
                                label: option.value,
                                value: option.id
                            }))
                        }
                    ],
                    screeners: expect.any(Array),
                    slug: mockSurvey.slug,
                    title: mockSurvey.title
                })
            );

            expect(mockRedis.get).toHaveBeenCalledWith(`screener:token:${mockSurvey.id}:${token}`);
        });

        it('returns survey without questions when token is invalid', async () => {
            setupSurveyMocks({screeners: mockScreenersList, questions: mockQuestionsList});

            const token = 'invalid-token-123';
            mockRedis.get.mockResolvedValueOnce(null);

            const res = await app.request(`/surveys/${mockSurvey.id}`, {
                headers: {'x-screener-token': token}
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.questions).toBeUndefined();
            expect(data.screeners).toBeDefined();
        });

        it('returns survey without questions when token is for different survey', async () => {
            setupSurveyMocks({screeners: mockScreenersList, questions: mockQuestionsList});

            const token = 'wrong-survey-token';
            mockRedis.get.mockResolvedValueOnce('different-survey-id');

            const res = await app.request(`/surveys/${mockSurvey.id}`, {
                headers: {'x-screener-token': token}
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.questions).toBeUndefined();
            expect(data.screeners).toBeDefined();
        });

        it('returns survey with questions when no screeners exist', async () => {
            setupSurveyMocks({screeners: [], questions: mockQuestionsList});

            const res = await app.request(`/surveys/${mockSurvey.id}`);
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.questions).toBeDefined();
            expect(data.screeners).toBeUndefined();
        });
    });

    describe('POST /:idOrSlug/responses', () => {
        const defaultRequestBody = {
            answers: {
                [mockQuestionsList[0]!.id]: {
                    endedAt: new Date().toISOString(),
                    startedAt: new Date(Date.now() - 1000).toISOString(),
                    wasSkipped: false,
                    value: mockQuestionAnswersList[0]!
                },
                [mockQuestionsList[1]!.id]: {
                    endedAt: new Date().toISOString(),
                    startedAt: new Date(Date.now() - 1000).toISOString(),
                    wasSkipped: true,
                    value: mockQuestionAnswersList[1]!
                },
                [mockQuestionsList[2]!.id]: {
                    endedAt: new Date().toISOString(),
                    startedAt: new Date(Date.now() - 1000).toISOString(),
                    wasSkipped: false,
                    value: mockQuestionAnswersList[2]!
                },
                [mockQuestionsList[3]!.id]: {
                    endedAt: new Date().toISOString(),
                    startedAt: new Date(Date.now() - 1000).toISOString(),
                    wasSkipped: false,
                    value: mockQuestionAnswersList[3]!
                }
            }
        };

        it('creates a response successfully', async () => {
            mockScenarios.successfulResponse();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': '192.168.1.1',
                    'user-agent': 'Test Browser'
                },
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});
        });

        it('handles transaction errors gracefully', async () => {
            mockScenarios.transactionError();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(500);

            const data = await res.json();
            expect(data).toEqual({error: 'internal_server_error'});
        });

        it('throws SurveyNotFoundError when survey does not exist', async () => {
            mockScenarios.surveyNotFound();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/non-existent-id/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(404);

            const data = await res.json();
            expect(data).toEqual({error: 'not_found'});
        });

        it('throws SurveyClosedError when survey is closed', async () => {
            mockScenarios.surveyClosed();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({error: 'closed'});
        });

        it('throws SurveyClosedError when survey is inactive', async () => {
            mockScenarios.inactiveSurvey();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({error: 'closed'});
        });

        it('throws SurveyClosedError when survey is archived', async () => {
            mockScenarios.archivedSurvey();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({error: 'closed'});
        });

        it('throws SurveyAuthenticationError when password is incorrect', async () => {
            mockScenarios.passwordProtected();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': 'wrong-password'
                },
                method: 'POST'
            });
            expect(res.status).toBe(401);

            const data = await res.json();
            expect(data).toEqual({error: 'authentication_required'});
        });

        it('throws SurveyAuthenticationError when password is missing for protected survey', async () => {
            mockScenarios.passwordProtected();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(401);

            const data = await res.json();
            expect(data).toEqual({error: 'authentication_required'});
        });

        it('allows access when correct password is provided', async () => {
            setupSurveyMocks({
                questions: mockQuestionsList,
                responseCount: 5,
                screeners: [],
                settings: {
                    ...mockSurveySettings,
                    isPasswordProtected: true,
                    password: 'dummy-encrypted-password' as any
                },
                transactionSuccess: true
            });

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': 'secret123'
                },
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});
        });

        it('handles idempotency key header and stores it in redis', async () => {
            mockScenarios.successfulResponse();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'unique-key-123'
                },
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});

            // verify redis was called to store the idempotency key
            expect(mockRedis.set).toHaveBeenCalledWith('unique-key-123', '1');
        });

        it('throws InvalidBodyError when answers are empty', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {answers: {}};
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data).toEqual({
                error: 'invalid_body',
                issues: [
                    {
                        code: 'invalid_type',
                        expected: 'object',
                        message: 'Required',
                        path: ['answers', 'text_question_id'],
                        received: 'undefined'
                    }
                ]
            });
        });

        it('throws InvalidBodyError when request body is invalid json', async () => {
            mockScenarios.successfulResponse();
            const requestBody = 'invalid-json';
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: requestBody,
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            // the error middleware should handle this and return 400 for invalid JSON
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data).toEqual({error: 'invalid_json'});
        });

        it('handles null answers', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {answers: null};
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data).toEqual({
                error: 'invalid_body',
                issues: [
                    {
                        code: 'invalid_type',
                        expected: 'object',
                        message: 'Expected object, received null',
                        path: ['answers'],
                        received: 'null'
                    }
                ]
            });
        });

        it('handles missing answers field', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {};
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data).toEqual({
                error: 'invalid_body',
                issues: [
                    {
                        code: 'invalid_type',
                        expected: 'object',
                        message: 'Required',
                        path: ['answers'],
                        received: 'undefined'
                    }
                ]
            });
        });

        it('returns idempotent response when idempotency key already exists', async () => {
            mockScenarios.idempotencyKeyExists();

            // mock redis to return existing key
            mockRedis.get.mockResolvedValueOnce('1');

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'duplicate-key-123'
                },
                method: 'POST'
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual({ok: true, idempotent: true});

            // verify redis was checked but not set again
            expect(mockRedis.get).toHaveBeenCalledWith('duplicate-key-123');
            expect(mockRedis.set).not.toHaveBeenCalled();
        });

        it('does not call redis when no idempotency key is provided', async () => {
            mockScenarios.successfulResponse();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});

            // verify redis was not called
            expect(mockRedis.get).not.toHaveBeenCalled();
            expect(mockRedis.set).not.toHaveBeenCalled();
        });

        it('handles redis errors during idempotency check', async () => {
            mockScenarios.successfulResponse();

            // mock redis to throw an error
            mockRedis.get.mockRejectedValueOnce(new Error('Redis connection failed'));

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                    'idempotency-key': 'error-key-123'
                },
                method: 'POST'
            });
            expect(res.status).toBe(500);

            const data = await res.json();
            expect(data).toEqual({error: 'internal_server_error'});

            // verify redis was called
            expect(mockRedis.get).toHaveBeenCalledWith('error-key-123');
        });

        it('handles various IP address headers', async () => {
            mockScenarios.successfulResponse();

            const requestBody = defaultRequestBody;
            // test with cf-connecting-ip header
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json', 'cf-connecting-ip': '203.0.113.1'},
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});
        });

        it('handles missing user agent gracefully', async () => {
            mockScenarios.successfulResponse();

            const requestBody = defaultRequestBody;
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});
        });

        it('handles invalid question IDs', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {
                answers: {
                    'invalid-question-id': defaultRequestBody.answers[mockQuestionsList[0]!.id],
                    [mockQuestionsList[1]!.id]:
                        defaultRequestBody.answers[mockQuestionsList[1]!.id],
                    [mockQuestionsList[2]!.id]:
                        defaultRequestBody.answers[mockQuestionsList[2]!.id],
                    [mockQuestionsList[3]!.id]: defaultRequestBody.answers[mockQuestionsList[3]!.id]
                }
            };
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data).toEqual({
                error: 'invalid_body',
                issues: [
                    {
                        code: 'invalid_type',
                        expected: 'object',
                        message: 'Required',
                        path: ['answers', 'text_question_id'],
                        received: 'undefined'
                    }
                ]
            });
        });

        it('handles multiple choices for single select', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {
                answers: {
                    ...defaultRequestBody.answers,
                    [mockQuestionsList[0]!.id]: {
                        ...defaultRequestBody.answers[mockQuestionsList[0]!.id],
                        value: [mockQuestionAnswersList[0]!, mockQuestionAnswersList[1]!]
                    }
                }
            };
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(400);

            const data = await res.json();
            expect(data).toEqual({
                error: 'invalid_body',
                issues: [
                    {
                        code: 'invalid_type',
                        expected: 'string',
                        message: 'Expected string, received array',
                        path: ['answers', 'text_question_id', 'value'],
                        received: 'array'
                    }
                ]
            });
        });

        it('handles special characters in answers', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {
                answers: {
                    ...defaultRequestBody.answers,
                    [mockQuestionsList[0]!.id]: {
                        ...defaultRequestBody.answers[mockQuestionsList[0]!.id],
                        value: 'Answer with "quotes", <tags>, & symbols!'
                    },
                    [mockQuestionsList[1]!.id]: {
                        ...defaultRequestBody.answers[mockQuestionsList[1]!.id],
                        value: 42.5
                    }
                }
            };
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});
        });

        it('handles missing answers for optional questions', async () => {
            mockScenarios.successfulResponse();

            const requestBody = {
                answers: {
                    ...defaultRequestBody.answers,
                    [mockQuestionsList[2]!.id]: {
                        ...defaultRequestBody.answers[mockQuestionsList[2]!.id],
                        value: null
                    },
                    [mockQuestionsList[3]!.id]: {
                        ...defaultRequestBody.answers[mockQuestionsList[3]!.id],
                        value: null
                    }
                }
            };
            const res = await app.request(`/surveys/${mockSurvey.id}/responses`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });

            if (res.status !== 201) {
                const errorData = await res.json();
                console.log('Error response:', errorData);
            }

            expect(res.status).toBe(201);

            const data = await res.json();
            expect(data).toEqual({ok: true});
        });
    });

    describe('POST /:idOrSlug/screeners', () => {
        it('returns success with token when all screeners pass', async () => {
            setupSurveyMocks({screeners: mockScreenersList});
            mockRedis.set.mockResolvedValueOnce(undefined);
            mockRedis.expire.mockResolvedValueOnce(undefined);

            const requestBody = {
                age: 25,
                country: 'GB',
                [mockSingleChoiceScreener.id]: 'correct_option_id'
            };

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual({
                ok: true,
                passed: true,
                token: expect.any(String)
            });
            expect(data.token).toMatch(/^[a-f0-9]{64}$/); // 64 char hex string

            // verify token was stored in redis
            expect(mockRedis.set).toHaveBeenCalled();
            expect(mockRedis.expire).toHaveBeenCalledWith(
                expect.stringContaining(`screener:token:${mockSurvey.id}:`),
                3600
            );
        });

        it('returns success when no screeners exist', async () => {
            setupSurveyMocks({screeners: []});

            const requestBody = {};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data).toEqual({
                ok: true,
                passed: true
            });
            expect(data.token).toBeUndefined();
        });

        it('returns failure when age screener fails', async () => {
            setupSurveyMocks({screeners: [mockAgeScreener]});

            const requestBody = {age: 15};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: mockAgeScreener.failureMessage,
                passed: false
            });
        });

        it('returns failure when location screener fails', async () => {
            setupSurveyMocks({screeners: [mockLocationScreener]});

            const requestBody = {country: 'FR'};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: mockLocationScreener.failureMessage,
                passed: false
            });
        });

        it('returns failure when single choice screener fails', async () => {
            setupSurveyMocks({screeners: [mockSingleChoiceScreener]});

            const requestBody = {[mockSingleChoiceScreener.id]: 'wrong_option_id'};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: mockSingleChoiceScreener.failureMessage,
                passed: false
            });
        });

        it('returns failure when age is missing', async () => {
            setupSurveyMocks({screeners: [mockAgeScreener]});

            const requestBody = {};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: mockAgeScreener.failureMessage,
                passed: false
            });
        });

        it('returns failure when country is missing', async () => {
            setupSurveyMocks({screeners: [mockLocationScreener]});

            const requestBody = {};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: mockLocationScreener.failureMessage,
                passed: false
            });
        });

        it('returns failure when first screener fails in multiple screeners', async () => {
            setupSurveyMocks({screeners: mockScreenersList});

            const requestBody = {
                age: 15, // fails
                country: 'GB',
                [mockSingleChoiceScreener.id]: 'correct_option_id'
            };

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: mockAgeScreener.failureMessage,
                passed: false
            });
        });

        it('validates age screener with "under" operator', async () => {
            const underAgeScreener = {
                ...mockAgeScreener,
                config: {operator: 'under', value: 65}
            };
            setupSurveyMocks({screeners: [underAgeScreener]});
            mockRedis.set.mockResolvedValueOnce(undefined);
            mockRedis.expire.mockResolvedValueOnce(undefined);

            const requestBody = {age: 50};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.passed).toBe(true);
        });

        it('returns default failure message when screener has no custom message', async () => {
            const screenerWithoutMessage = {
                ...mockAgeScreener,
                failureMessage: null
            } as typeof mockAgeScreener & {failureMessage: null};
            setupSurveyMocks({screeners: [screenerWithoutMessage]});

            const requestBody = {age: 15};

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(403);

            const data = await res.json();
            expect(data).toEqual({
                ok: false,
                message: 'You do not meet the requirements for this survey.',
                passed: false
            });
        });

        it('handles multiple screeners in order', async () => {
            setupSurveyMocks({screeners: mockScreenersList});
            mockRedis.set.mockResolvedValueOnce(undefined);
            mockRedis.expire.mockResolvedValueOnce(undefined);

            const requestBody = {
                age: 25,
                country: 'US',
                [mockSingleChoiceScreener.id]: 'correct_option_id'
            };

            const res = await app.request(`/surveys/${mockSurvey.id}/screeners`, {
                body: JSON.stringify(requestBody),
                headers: {'Content-Type': 'application/json'},
                method: 'POST'
            });
            expect(res.status).toBe(200);

            const data = await res.json();
            expect(data.passed).toBe(true);
            expect(data.token).toBeDefined();
        });
    });
});

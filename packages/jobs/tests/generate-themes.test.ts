import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

// set environment variables before any imports
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// mock supabase before database module tries to use it
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        auth: {},
        from: vi.fn()
    }))
}));

// mock postgres before database connection tries to use it
vi.mock('postgres', () => {
    return vi.fn(() => ({}));
});

// mock dependencies before they're imported
vi.mock('ai', () => ({
    generateObject: vi.fn()
}));

vi.mock('@sentry/node', () => ({
    default: {
        captureException: vi.fn()
    },
    captureException: vi.fn()
}));

vi.mock('@glint/database', () => {
    const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        transaction: vi.fn(),
        delete: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        returning: vi.fn()
    };

    return {
        db: mockDb,
        surveys: {id: 'id', tenantId: 'tenantId'},
        questions: {id: 'id', surveyId: 'surveyId', type: 'type'},
        answers: {id: 'id', questionId: 'questionId', value: 'value'},
        analysisThemes: {id: 'id', questionId: 'questionId'},
        analysisThemeEntries: {}
    };
});

vi.mock('@trigger.dev/sdk', () => ({
    logger: {
        log: vi.fn(),
        error: vi.fn()
    },
    schemaTask: vi.fn(config => config)
}));

import * as Sentry from '@sentry/node';
// import after mocks are set up
import {generateObject} from 'ai';

describe('generate-themes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('buildThemeGenerationPrompt', () => {
        it('generates prompt with correct format', async () => {
            const {buildThemeGenerationPrompt} = await import('../src/prompts');

            const prompt = buildThemeGenerationPrompt({
                minimisedAnswers: [
                    [0, 'answer one'],
                    [1, 'answer two']
                ],
                questionText: 'What is your opinion?',
                surveyContext: 'Customer Feedback Survey - Please share your thoughts'
            });

            expect(prompt).toContain('Customer Feedback Survey - Please share your thoughts');
            expect(prompt).toContain('What is your opinion?');
            expect(prompt).toContain('answer one');
            expect(prompt).toContain('answer two');
            expect(prompt).toContain('Group the provided survey answers into semantic themes');
        });
    });

    describe('generateThemesTask', () => {
        it('returns success when survey not found', async () => {
            const {db} = await import('@glint/database');
            const {generateThemesTask} = await import('../src/generate-themes');

            // mock survey not found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([])
                    })
                })
            } as any);

            const result = await generateThemesTask.run({
                surveyId: 'non-existent-id',
                tenantId: 'tenant-id'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('not found');
        });

        it('returns success when no text or number questions found', async () => {
            const {db} = await import('@glint/database');
            const {generateThemesTask} = await import('../src/generate-themes');

            const mockSurvey = {
                id: 'survey-id',
                tenantId: 'tenant-id',
                title: 'Test Survey',
                description: 'Test Description'
            };

            // mock survey found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([mockSurvey])
                    })
                })
            } as any);

            // mock no questions found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([])
                })
            } as any);

            const result = await generateThemesTask.run({
                surveyId: 'survey-id',
                tenantId: 'tenant-id'
            });

            expect(result.success).toBe(true);
            expect(result.processedQuestions).toBe(0);
            expect(result.message).toContain('No text or number questions found');
        });

        it('returns success when no questions with answers found', async () => {
            const {db} = await import('@glint/database');
            const {generateThemesTask} = await import('../src/generate-themes');

            const mockSurvey = {
                id: 'survey-id',
                tenantId: 'tenant-id',
                title: 'Test Survey',
                description: 'Test Description'
            };

            const mockQuestions = [
                {id: 'q1', type: 'text', surveyId: 'survey-id'},
                {id: 'q2', type: 'number', surveyId: 'survey-id'}
            ];

            // mock survey found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([mockSurvey])
                    })
                })
            } as any);

            // mock questions found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce(mockQuestions)
                })
            } as any);

            // mock no questions with answers
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            groupBy: vi.fn().mockResolvedValueOnce([])
                        })
                    })
                })
            } as any);

            const result = await generateThemesTask.run({
                surveyId: 'survey-id',
                tenantId: 'tenant-id'
            });

            expect(result.success).toBe(true);
            expect(result.processedQuestions).toBe(0);
            expect(result.message).toContain('No questions with answers found');
        });

        it('processes themes for questions with answers', async () => {
            const {db} = await import('@glint/database');
            const {generateThemesTask} = await import('../src/generate-themes');

            const mockSurvey = {
                id: 'survey-id',
                tenantId: 'tenant-id',
                title: 'Test Survey',
                description: 'Test Description'
            };

            const mockQuestion = {
                id: 'q1',
                type: 'text',
                surveyId: 'survey-id',
                title: 'What is your opinion?',
                description: 'Please share your thoughts'
            };

            const mockAnswer = {
                id: 'a1',
                questionId: 'q1',
                value: 'Great product!',
                responseId: 'r1'
            };

            // mock survey found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([mockSurvey])
                    })
                })
            } as any);

            // mock questions found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([mockQuestion])
                })
            } as any);

            // mock questions with answers
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            groupBy: vi.fn().mockResolvedValueOnce([{id: 'q1'}])
                        })
                    })
                })
            } as any);

            // mock answers query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([mockAnswer])
                })
            } as any);

            // mock AI response
            vi.mocked(generateObject).mockResolvedValueOnce({
                object: {
                    themes: [
                        {
                            answerIds: [0],
                            description: 'Customers expressing satisfaction',
                            name: 'Positive Feedback',
                            sentiment: 'positive'
                        }
                    ]
                }
            } as any);

            // mock transaction
            const mockTx = {
                delete: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValueOnce(undefined),
                insert: vi.fn().mockReturnThis(),
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValueOnce([{id: 'theme-1'}])
            };

            vi.mocked(db.transaction).mockImplementation(async (callback: any) => {
                return callback(mockTx);
            });

            const result = await generateThemesTask.run({
                surveyId: 'survey-id',
                tenantId: 'tenant-id'
            });

            expect(result.success).toBe(true);
            expect(result.processedQuestions).toBe(1);
            expect(result.totalQuestions).toBe(1);
            expect(result.errorCount).toBe(0);
            expect(generateObject).toHaveBeenCalled();
        });

        it('handles errors during theme generation', async () => {
            const {db} = await import('@glint/database');
            const {generateThemesTask} = await import('../src/generate-themes');

            const mockSurvey = {
                id: 'survey-id',
                tenantId: 'tenant-id',
                title: 'Test Survey',
                description: 'Test Description'
            };

            const mockQuestion = {
                id: 'q1',
                type: 'text',
                surveyId: 'survey-id',
                title: 'What is your opinion?',
                description: null
            };

            // mock survey found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockReturnValueOnce({
                        limit: vi.fn().mockResolvedValueOnce([mockSurvey])
                    })
                })
            } as any);

            // mock questions found
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi.fn().mockResolvedValueOnce([mockQuestion])
                })
            } as any);

            // mock questions with answers
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    innerJoin: vi.fn().mockReturnValueOnce({
                        where: vi.fn().mockReturnValueOnce({
                            groupBy: vi.fn().mockResolvedValueOnce([{id: 'q1'}])
                        })
                    })
                })
            } as any);

            // mock answers query
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnValueOnce({
                    where: vi
                        .fn()
                        .mockResolvedValueOnce([
                            {id: 'a1', questionId: 'q1', value: 'Answer', responseId: 'r1'}
                        ])
                })
            } as any);

            // mock AI error
            vi.mocked(generateObject).mockRejectedValueOnce(new Error('AI service error'));

            const result = await generateThemesTask.run({
                surveyId: 'survey-id',
                tenantId: 'tenant-id'
            });

            expect(result.success).toBe(true);
            expect(result.processedQuestions).toBe(0);
            expect(result.errorCount).toBe(1);
            expect(Sentry.captureException).toHaveBeenCalled();
        });

        it('handles general errors gracefully', async () => {
            const {db} = await import('@glint/database');
            const {generateThemesTask} = await import('../src/generate-themes');

            // mock database error
            vi.mocked(db.select).mockImplementationOnce(() => {
                throw new Error('Database connection error');
            });

            const result = await generateThemesTask.run({
                surveyId: 'survey-id',
                tenantId: 'tenant-id'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Database connection error');
            expect(Sentry.captureException).toHaveBeenCalled();
        });
    });
});

import {db, metrics, questions, responseSubmissions} from '@glint/database';
import type {ProcessResponseSubmissionTaskPayload} from '@glint/jobs/schema';
import {createResponseSchema} from '@glint/schemas';
import {tasks} from '@trigger.dev/sdk';
import {asc, eq} from 'drizzle-orm';
import {Hono} from 'hono';
import {InvalidBodyError} from '@/middleware/errors';
import type {ServerContext} from '@/types/server';
import {
    createSurveyResponse,
    generateScreenerToken,
    getSurveyScreeners,
    storeScreenerToken,
    transformQuestion,
    transformScreener,
    validateAgeScreener,
    validateLocationScreener,
    validateSelectionScreener,
    verifyIdempotency,
    verifyScreenerToken,
    verifyScreenerTokenIfRequired,
    verifySurveyIsActive,
    verifySurveyPassword
} from './utils';

const router = new Hono<ServerContext>();

router.get('/:idOrSlug', verifySurveyIsActive, async c => {
    const survey = c.get('survey');
    const settings = c.get('settings');

    // get screeners for this survey
    const screenerRows = await getSurveyScreeners(survey.id);
    const transformedScreeners = screenerRows.map(transformScreener);

    // if screeners exist, verify token
    if (screenerRows.length > 0) {
        const token = c.req.header('x-screener-token');
        const isValidToken = await verifyScreenerToken(survey.id, token);

        if (!isValidToken) {
            // return survey metadata and screeners only, no questions
            const baseData = {
                allowAnonymous: settings?.allowAnonymous || false,
                campaignId: survey.campaignId,
                closedText: settings?.closedText || '',
                description: survey.description ?? '',
                id: survey.id,
                isClosed: survey.status !== 'active',
                isPasswordProtected: settings?.isPasswordProtected || false,
                screeners: transformedScreeners,
                slug: survey.slug,
                title: survey.title
            };
            return c.json(baseData);
        }
    }

    // no screeners or valid token - return full response with questions
    const allQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.surveyId, survey.id))
        .orderBy(asc(questions.order));
    const surveyQuestions = allQuestions.map(transformQuestion);

    const responseData = createSurveyResponse(
        survey,
        settings,
        surveyQuestions,
        undefined,
        transformedScreeners
    );

    return c.json(responseData);
});

router.post(
    '/:idOrSlug/responses',
    verifySurveyIsActive,
    verifySurveyPassword,
    verifyScreenerTokenIfRequired,
    verifyIdempotency,
    async c => {
        const survey = c.get('survey');
        const allQuestions = await db
            .select()
            .from(questions)
            .where(eq(questions.surveyId, survey.id))
            .orderBy(asc(questions.order));
        const responseSchema = createResponseSchema(allQuestions);
        const body = await c.req.json();
        const validationResult = responseSchema.safeParse(body);

        if (!validationResult.success) {
            throw new InvalidBodyError(validationResult.error.issues);
        }

        const validatedBody = validationResult.data;
        const questionIds = allQuestions.map(q => q.id);
        const questionVersions = new Map(
            allQuestions.map(question => {
                const version = (question.metadata as {version?: number} | null)?.version;
                return [question.id, typeof version === 'number' && version > 0 ? version : 1];
            })
        );
        const answersWithVersion = Object.fromEntries(
            Object.entries(validatedBody.answers).map(([questionId, answer]) => {
                const questionVersion = questionVersions.get(questionId) ?? 1;
                return [
                    questionId,
                    {
                        ...answer,
                        metadata: {...(answer.metadata ?? {}), questionVersion}
                    }
                ];
            })
        );

        for (const [questionId] of Object.entries(validatedBody.answers)) {
            if (!questionIds.includes(questionId)) {
                throw new InvalidBodyError();
            }
        }

        const ip =
            c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
            c.req.header('cf-connecting-ip') ||
            c.req.header('x-real-ip') ||
            '';
        const ua = c.req.header('user-agent') || '';
        const submissionBody = {
            answers: answersWithVersion,
            metadata: {ip, ua},
            respondent: validatedBody.respondent
        };
        const [submission] = await db
            .insert(responseSubmissions)
            .values({
                body: submissionBody,
                surveyId: survey.id,
                tenantId: survey.tenantId
            })
            .returning();

        if (!submission) {
            throw new Error('Failed to create response submission');
        }

        await tasks.trigger('process-response-submission', {
            submissionId: submission.id
        } satisfies ProcessResponseSubmissionTaskPayload);

        return c.json({ok: true}, 201);
    }
);

// screener validation endpoint
router.post('/:idOrSlug/screeners', verifySurveyIsActive, async c => {
    const survey = c.get('survey');
    const body = await c.req.json();
    const screenerRows = await getSurveyScreeners(survey.id);

    if (screenerRows.length === 0) {
        return c.json({ok: true, passed: true}, 200);
    }

    const results: Array<{id: string; passed: boolean; message?: string}> = [];

    for (const screenerRow of screenerRows) {
        const config = screenerRow.config as Record<string, unknown>;
        let passed = false;
        let submittedAnswer: unknown = null;

        if (screenerRow.type === 'age') {
            const age = body.age as number | null | undefined;
            submittedAnswer = age;
            const ageConfig = config as {operator: 'over' | 'under'; value: number};
            passed = validateAgeScreener(age, ageConfig);
        } else if (screenerRow.type === 'location') {
            const country = body.country as string | null | undefined;
            submittedAnswer = country;
            const locationConfig = config as {countries: string[]};
            passed = validateLocationScreener(country, locationConfig);
        } else if (screenerRow.type === 'selection') {
            const optionId = body[screenerRow.id] as string | null | undefined;
            submittedAnswer = optionId;
            const selectionConfig = config as {
                options: Array<{id: string; passes: boolean}>;
            };
            passed = validateSelectionScreener(optionId, selectionConfig);
        }

        results.push({
            id: screenerRow.id,
            message: screenerRow.failureMessage || undefined,
            passed
        });

        if (!passed) {
            await db.insert(metrics).values({
                entityId: screenerRow.id,
                entityType: 'screener',
                metadata: {submittedAnswer},
                metricType: 'screener_failure',
                surveyId: survey.id,
                tenantId: survey.tenantId
            });

            return c.json(
                {
                    ok: false,
                    message:
                        screenerRow.failureMessage ||
                        'You do not meet the requirements for this survey.',
                    passed: false
                },
                403
            );
        }
    }

    // all screeners passed, generate token
    const token = generateScreenerToken();
    await storeScreenerToken(survey.id, token);

    return c.json({ok: true, passed: true, token}, 200);
});

export default router;

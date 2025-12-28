import {db, questions, responseSubmissions} from '@glint/database';
import type {ProcessResponseSubmissionTaskPayload} from '@glint/jobs/schema';
import {createResponseSchema} from '@glint/schemas';
import {tasks} from '@trigger.dev/sdk';
import {asc, eq} from 'drizzle-orm';
import {Hono} from 'hono';
import {InvalidBodyError} from '@/middleware/errors';
import type {ServerContext} from '@/types/server';
import {
    createSurveyResponse,
    getSurveyScreeners,
    transformQuestion,
    transformScreener,
    validateAgeScreener,
    validateLocationScreener,
    validateSingleChoiceScreener,
    verifyIdempotency,
    verifySurveyIsActive,
    verifySurveyPassword
} from './utils';

const router = new Hono<ServerContext>();

router.get('/:idOrSlug', verifySurveyIsActive, async c => {
    const survey = c.get('survey');
    const settings = c.get('settings');

    const allQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.surveyId, survey.id))
        .orderBy(asc(questions.order));
    const surveyQuestions = allQuestions.map(transformQuestion);

    // get screeners for this survey
    const screenerRows = await getSurveyScreeners(survey.id);
    const transformedScreeners = screenerRows.map(transformScreener);

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

    // validate each screener
    const results: Array<{id: string; passed: boolean; message?: string}> = [];

    for (const screenerRow of screenerRows) {
        const config = screenerRow.config as Record<string, unknown>;
        let passed = false;

        if (screenerRow.type === 'age') {
            const age = body.age as number | null | undefined;
            const ageConfig = config as {operator: 'over' | 'under'; value: number};
            passed = validateAgeScreener(age, ageConfig);
        } else if (screenerRow.type === 'location') {
            const country = body.country as string | null | undefined;
            const locationConfig = config as {countries: string[]};
            passed = validateLocationScreener(country, locationConfig);
        } else if (screenerRow.type === 'single_choice') {
            const optionId = body[screenerRow.id] as string | null | undefined;
            const singleChoiceConfig = config as {correctOptionId: string};
            passed = validateSingleChoiceScreener(optionId, singleChoiceConfig);
        }

        results.push({
            id: screenerRow.id,
            message: screenerRow.failureMessage || undefined,
            passed
        });

        // if any screener fails, return failure
        if (!passed) {
            return c.json(
                {
                    ok: false,
                    message: screenerRow.failureMessage || 'You do not meet the requirements for this survey.',
                    passed: false
                },
                403
            );
        }
    }

    return c.json({ok: true, passed: true}, 200);
});

export default router;

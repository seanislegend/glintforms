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
    transformQuestion,
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
    const responseData = createSurveyResponse(survey, settings, surveyQuestions);

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
        const submissionBody = {...validatedBody, metadata: {ip, ua}};
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

export default router;

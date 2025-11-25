import {createHash} from 'node:crypto';
import {activities, answers, db, questions, respondents, responses, surveys} from '@glint/database';
import {createResponseSchema} from '@glint/schemas';
import {asc, eq} from 'drizzle-orm';
import {Hono} from 'hono';
import {generateAuthenticityScoreTask} from '@/lib/jobs/generate-authenticity-score.js';
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

// hash function for anti-abuse fingerprints
const sha256 = (x: string) => createHash('sha256').update(x).digest('hex');

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
            console.log(body);
            console.log(validationResult.error);
            throw new InvalidBodyError();
        }

        const validatedBody = validationResult.data;
        const questionIds = allQuestions.map(q => q.id);

        for (const [questionId] of Object.entries(validatedBody.answers)) {
            if (!questionIds.includes(questionId)) {
                throw new InvalidBodyError();
            }
        }

        // get client info
        const ip =
            c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
            c.req.header('cf-connecting-ip') ||
            c.req.header('x-real-ip') ||
            '';
        const ua = c.req.header('user-agent') || '';

        const processedAnswers = Object.entries(validatedBody.answers).map(
            ([questionId, value]) => ({
                ...value,
                questionId
            })
        );
        const responseStartedAt = processedAnswers[0].startedAt;
        const responseEndedAt = processedAnswers[processedAnswers.length - 1].endedAt;

        await db.transaction(async tx => {
            // create or find existing respondent if respondent data is provided
            let respondentId: string | null = null;
            if (validatedBody.respondent) {
                const [existingRespondent] = await tx
                    .select()
                    .from(respondents)
                    .where(eq(respondents.email, validatedBody.respondent.email))
                    .limit(1);

                if (existingRespondent) {
                    respondentId = existingRespondent.id;
                } else {
                    const [newRespondent] = await tx
                        .insert(respondents)
                        .values({...validatedBody.respondent, tenantId: survey.tenantId})
                        .returning();
                    if (!newRespondent) {
                        throw new Error('Failed to create respondent');
                    }
                    respondentId = newRespondent.id;
                }
            }

            const [response] = await tx
                .insert(responses)
                .values({
                    endedAt: responseEndedAt,
                    metadata: {
                        ipHash: ip ? sha256(ip) : null,
                        uaHash: ua ? sha256(ua) : null
                    },
                    respondentId,
                    startedAt: responseStartedAt,
                    surveyId: survey.id,
                    tenantId: survey.tenantId,
                    wasCompleted: true
                })
                .returning();
            if (!response) {
                throw new Error('Failed to create response');
            }

            for (const answer of processedAnswers) {
                await tx.insert(answers).values({
                    ...answer,
                    responseId: response.id
                });
            }

            if (!survey.hasResponses) {
                await tx.update(surveys).set({hasResponses: true}).where(eq(surveys.id, survey.id));
            }

            await db.insert(activities).values({
                details: {
                    completedAnswers: processedAnswers.filter(a => !a.wasSkipped).length,
                    responseId: response.id,
                    totalAnswers: processedAnswers.length
                },
                surveyId: survey.id,
                tenantId: survey.tenantId,
                text: 'Response submitted',
                type: 'respondes_recorded'
            });

            await generateAuthenticityScoreTask.trigger({
                responseId: response.id,
                surveyId: survey.id,
                campaignId: survey.campaignId
            });
        });

        return c.json({ok: true}, 201);
    }
);

export default router;

import {createHash} from 'node:crypto';
import {
    activities,
    answers,
    db,
    respondents,
    responseSubmissions,
    responses,
    surveys
} from '@glint/database';
import type {ResponseSubmissionBody} from '@glint/schemas';
import * as Sentry from '@sentry/node';
import {logger, task} from '@trigger.dev/sdk';
import {eq} from 'drizzle-orm';
import {generateAuthenticityScoreTask} from './generate-authenticity-score.js';

const sha256 = (x: string) => createHash('sha256').update(x).digest('hex');

export const processResponseSubmissionTask = task({
    id: 'process-response-submission',
    maxDuration: 300,
    run: async (payload: {submissionId: string}, {ctx}) => {
        logger.log('Starting response submission processing', {payload, ctx});

        try {
            const {submissionId} = payload;
            const [submission] = await db
                .select()
                .from(responseSubmissions)
                .where(eq(responseSubmissions.id, submissionId))
                .limit(1);

            if (!submission) {
                throw new Error(`Submission ${submissionId} not found`);
            }

            if (submission.processedAt) {
                logger.log('Submission already processed', {submissionId});
                return {
                    success: true,
                    message: 'Submission already processed',
                    skipped: true
                };
            }
            const submissionBody = submission.body as ResponseSubmissionBody;
            const [survey] = await db
                .select()
                .from(surveys)
                .where(eq(surveys.id, submission.surveyId))
                .limit(1);

            if (!survey) {
                throw new Error(`Survey ${submission.surveyId} not found`);
            }

            const processedAnswers = Object.entries(submissionBody.answers).map(
                ([questionId, value]) => ({...value, questionId})
            );
            const responseStartedAt = processedAnswers[0]?.startedAt;
            const responseEndedAt = processedAnswers[processedAnswers.length - 1]?.endedAt;

            await db.transaction(async tx => {
                // create or find existing respondent if respondent data is provided
                let respondentId: string | null = null;
                if (submissionBody.respondent) {
                    const [existingRespondent] = await tx
                        .select()
                        .from(respondents)
                        .where(eq(respondents.email, submissionBody.respondent.email))
                        .limit(1);

                    if (existingRespondent) {
                        respondentId = existingRespondent.id;
                    } else {
                        const [newRespondent] = await tx
                            .insert(respondents)
                            .values({
                                ...submissionBody.respondent,
                                tenantId: submission.tenantId
                            })
                            .returning();
                        if (!newRespondent) {
                            throw new Error('Failed to create respondent');
                        }
                        respondentId = newRespondent.id;
                    }
                }

                // extract metadata from submission body if available
                const ip = submissionBody.metadata?.ip || '';
                const ua = submissionBody.metadata?.ua || '';

                const [response] = await tx
                    .insert(responses)
                    .values({
                        endedAt: responseEndedAt ? new Date(responseEndedAt) : new Date(),
                        metadata: {
                            ipHash: ip ? sha256(ip) : null,
                            uaHash: ua ? sha256(ua) : null
                        },
                        respondentId,
                        startedAt: responseStartedAt ? new Date(responseStartedAt) : new Date(),
                        surveyId: submission.surveyId,
                        tenantId: submission.tenantId,
                        wasCompleted: true
                    })
                    .returning();
                if (!response) {
                    throw new Error('Failed to create response');
                }

                for (const answer of processedAnswers) {
                    await tx.insert(answers).values({
                        ...answer,
                        endedAt: answer.endedAt ? new Date(answer.endedAt) : null,
                        responseId: response.id,
                        startedAt: answer.startedAt ? new Date(answer.startedAt) : new Date()
                    });
                }

                if (!survey.hasResponses) {
                    await tx
                        .update(surveys)
                        .set({hasResponses: true})
                        .where(eq(surveys.id, survey.id));
                }

                await tx.insert(activities).values({
                    details: {
                        completedAnswers: processedAnswers.filter(a => !a.wasSkipped).length,
                        responseId: response.id,
                        totalAnswers: processedAnswers.length
                    },
                    surveyId: submission.surveyId,
                    tenantId: submission.tenantId,
                    text: 'Response submitted',
                    type: 'respondes_recorded'
                });
                await tx
                    .update(responseSubmissions)
                    .set({body: {}, failureReason: null, processedAt: new Date()})
                    .where(eq(responseSubmissions.id, submissionId));
                await generateAuthenticityScoreTask.trigger({
                    campaignId: survey.campaignId,
                    responseId: response.id,
                    surveyId: submission.surveyId
                });
            });

            logger.log('Response submission processed successfully', {submissionId});

            return {
                success: true,
                message: 'Response submission processed successfully'
            };
        } catch (error) {
            logger.error('Failed to process response submission', {error});
            Sentry.captureException(error);
            const failureReason = error instanceof Error ? error.message : 'Unknown error';

            try {
                const {submissionId} = payload;
                await db
                    .update(responseSubmissions)
                    .set({failureReason})
                    .where(eq(responseSubmissions.id, submissionId));
            } catch (updateError) {
                logger.error('Failed to update submission with failure reason', {
                    error: updateError
                });
            }

            return {
                error: failureReason,
                message: 'Failed to process response submission',
                success: false
            };
        }
    }
});

import {authenticityScores, db} from '@glint/database';
import * as Sentry from '@sentry/node';
import {logger, task} from '@trigger.dev/sdk';
import {calculateAuthenticityData, callAiService, extractFailureReasons} from '@/lib/authenticity';
import {buildAuthenticityPrompt} from '../authenticity/prompts';
import {authenticityResultSchema} from '../authenticity/schemas';

export const generateAuthenticityScoreTask = task({
    id: 'generate-authenticity-score',
    maxDuration: 300,
    run: async (
        payload: {
            responseId: string;
            surveyId: string;
            campaignId: string;
        },
        {ctx}
    ) => {
        logger.log('Starting authenticity score generation', {payload, ctx});

        try {
            const {responseId, surveyId} = payload;
            const authenticityData = await calculateAuthenticityData(db, responseId, surveyId);
            const prompt = buildAuthenticityPrompt(authenticityData);
            const aiResponseRaw = await callAiService(prompt);
            const aiResult = authenticityResultSchema.parse(JSON.parse(aiResponseRaw));

            const [authenticityScore] = await db
                .insert(authenticityScores)
                .values({
                    metadata: {
                        aiReasoning: aiResult.reasoning,
                        checks: aiResult.checks,
                        expectedDurationMinutes: authenticityData.expectedDurationMinutes,
                        actualDurationMinutes: authenticityData.actualDurationMinutes,
                        totalQuestions: authenticityData.totalQuestions,
                        failureReasons: extractFailureReasons(aiResult)
                    },
                    percentage: aiResult.percentage,
                    responseId,
                    surveyId
                })
                .returning();

            logger.log('Authenticity score generated successfully', {authenticityScore});

            return {
                success: true,
                authenticityScore,
                message: 'Authenticity score generated successfully'
            };
        } catch (error) {
            logger.error('Failed to generate authenticity score', {error});

            Sentry.captureException(error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to generate authenticity score'
            };
        }
    }
});

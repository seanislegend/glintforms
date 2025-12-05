import {generateAuthenticityScore} from '@glint/authenticity';
import * as Sentry from '@sentry/node';
import {schemaTask} from '@trigger.dev/sdk';
import {generateAuthenticityScoreTaskSchema} from './schema';

export const generateAuthenticityScoreTask = schemaTask({
    id: 'generate-authenticity-score',
    maxDuration: 300,
    schema: generateAuthenticityScoreTaskSchema,
    run: async payload => {
        try {
            const {responseId, surveyId} = payload;
            const authenticityScore = await generateAuthenticityScore(responseId, surveyId);

            return {
                success: true,
                authenticityScore,
                message: 'Authenticity score generated successfully'
            };
        } catch (error) {
            Sentry.captureException(error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to generate authenticity score'
            };
        }
    }
});

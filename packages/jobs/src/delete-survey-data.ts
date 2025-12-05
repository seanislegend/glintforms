import {
    activities,
    analysisThemes,
    authenticityScores,
    db,
    questions,
    responses
} from '@glint/database';
import {schemaTask} from '@trigger.dev/sdk';
import {eq, inArray} from 'drizzle-orm';
import {deleteSurveyDataTaskSchema} from './schema';

export const deleteSurveyData = schemaTask({
    id: 'delete-survey-data',
    maxDuration: 300,
    schema: deleteSurveyDataTaskSchema,
    run: async payload => {
        try {
            const {surveyId, tenantId} = payload;

            await db.transaction(async tx => {
                const allQuestions = await tx
                    .select()
                    .from(questions)
                    .where(eq(questions.surveyId, surveyId));

                await tx.delete(responses).where(eq(responses.surveyId, surveyId));
                await tx
                    .delete(authenticityScores)
                    .where(eq(authenticityScores.surveyId, surveyId));
                await tx.delete(analysisThemes).where(
                    inArray(
                        analysisThemes.questionId,
                        allQuestions.map(q => q.id)
                    )
                );
                await tx.insert(activities).values({
                    surveyId,
                    tenantId,
                    type: 'deleted',
                    text: 'Survey testing completed'
                });
            });

            return {
                success: true,
                message: 'Survey data deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to delete survey data'
            };
        }
    }
});

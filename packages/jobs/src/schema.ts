import {z} from 'zod';

export const processResponseSubmissionTaskSchema = z.object({
    submissionId: z.string()
});

export type ProcessResponseSubmissionTaskPayload = z.infer<
    typeof processResponseSubmissionTaskSchema
>;

export const generateAuthenticityScoreTaskSchema = z.object({
    responseId: z.string(),
    surveyId: z.string(),
    campaignId: z.string()
});

export type GenerateAuthenticityScoreTaskPayload = z.infer<
    typeof generateAuthenticityScoreTaskSchema
>;

export const deleteSurveyDataTaskSchema = z.object({
    surveyId: z.string(),
    tenantId: z.string()
});

export type DeleteSurveyDataTaskPayload = z.infer<typeof deleteSurveyDataTaskSchema>;

export const generateThemesTaskSchema = z.object({
    surveyId: z.string(),
    tenantId: z.string()
});

export type GenerateThemesTaskPayload = z.infer<typeof generateThemesTaskSchema>;

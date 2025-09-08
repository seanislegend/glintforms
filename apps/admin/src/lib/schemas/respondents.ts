import type {genderTypes, respondents} from '@glint/database';
import {z} from 'zod';

export type RespondentList = Pick<
    typeof respondents.$inferSelect,
    'id' | 'name' | 'email' | 'gender' | 'updatedAt'
> & {
    surveys: Array<{
        id: string;
        title: string;
        campaignId: string | null;
        campaignTitle: string | null;
    }>;
};

export type RespondentDetails = typeof respondents.$inferSelect & {
    surveys: Array<{
        id: string;
        title: string;
        responseCount: number;
        campaignId: string | null;
        campaignTitle: string | null;
        campaignDescription: string | null;
        campaignIsActive: boolean | null;
        campaignCreatedAt: Date | null;
    }>;
    avgAuthenticityScore: number;
    totalResponsesWithScores: number;
};

export const respondentInsertSchema = z.object({
    email: z.string().email(),
    name: z.string().min(1),
    notes: z.string().optional(),
    signupSource: z.string().optional()
});

export const respondentUpdateSchema = respondentInsertSchema.partial();

export type RespondentInsert = z.infer<typeof respondentInsertSchema>;
export type RespondentUpdate = z.infer<typeof respondentUpdateSchema>;

export type RespondentGender = (typeof genderTypes)[number];

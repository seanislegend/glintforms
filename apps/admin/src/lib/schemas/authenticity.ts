import type {authenticityScores, user} from '@glint/database';
import {z} from 'zod';

export type AuthenticityScoreList = Pick<
    typeof authenticityScores.$inferSelect,
    'id' | 'overrideReason'
>;

export type AuthenticityScore = Pick<
    typeof authenticityScores.$inferSelect,
    | 'id'
    | 'metadata'
    | 'overrideOriginalPercentage'
    | 'overrideReason'
    | 'overrideTimestamp'
    | 'overrideUserId'
    | 'percentage'
> & {
    overrideUser?: Pick<typeof user.$inferSelect, 'id' | 'name'> | null;
};

export const authenticityScoreOverrideSchema = z.object({
    id: z.string(),
    overrideReason: z
        .string()
        .min(1, /* i18n */ 'You must provide a reason')
        .max(1000, /* i18n */ 'Reason is too long'),
    originalScore: z.number().min(0).max(100)
}) satisfies z.ZodType<
    Omit<typeof authenticityScores.$inferInsert, 'surveyId' | 'responseId' | 'percentage'>
>;

export type AuthenticityScoreOverride = z.infer<typeof authenticityScoreOverrideSchema>;

export const authenticityScoreOverrideUpdateSchema = authenticityScoreOverrideSchema.pick({
    overrideReason: true
});

export const authenticityResultSchema = z.object({
    percentage: z.number().min(0).max(100),
    reasoning: z.string(),
    checks: z.object({
        durationCheck: z.object({passed: z.boolean(), details: z.string()}),
        relevanceCheck: z.object({passed: z.boolean(), details: z.string()}),
        optionCheck: z.object({passed: z.boolean(), details: z.string()}),
        completionCheck: z.object({passed: z.boolean(), details: z.string()}),
        consistencyCheck: z.object({passed: z.boolean(), details: z.string()})
    })
});

export type AuthenticityResult = z.infer<typeof authenticityResultSchema>;

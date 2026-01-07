import {generateAuthenticityScore} from '@glint/authenticity';
import {authenticityScores, user} from '@glint/database';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {getServerI18n} from '@/lib/i18n-server';
import {isAuthenticityPass} from '@/utils/authenticity';
import {protectedProcedure} from '../init';

export const authenticityRouter = {
    get: protectedProcedure
        .input(z.object({responseId: z.string()}))
        .query(async ({input: {responseId}, ctx}) => {
            const authenticityScore = await ctx.db
                .select({
                    createdAt: authenticityScores.createdAt,
                    id: authenticityScores.id,
                    isOverridden: authenticityScores.isOverridden,
                    metadata: authenticityScores.metadata,
                    overrideReason: authenticityScores.overrideReason,
                    overrideOriginalPercentage: authenticityScores.overrideOriginalPercentage,
                    overrideTimestamp: authenticityScores.overrideTimestamp,
                    overrideUserId: authenticityScores.overrideUserId,
                    percentage: authenticityScores.percentage,
                    updatedAt: authenticityScores.updatedAt,
                    overrideUser: {
                        id: user.id,
                        name: user.name
                    }
                })
                .from(authenticityScores)
                .where(eq(authenticityScores.responseId, responseId))
                .leftJoin(user, eq(authenticityScores.overrideUserId, user.id))
                .limit(1);

            const result = authenticityScore[0];
            if (!result) return null;

            return {
                ...result,
                isPass: isAuthenticityPass(result.percentage)
            };
        }),
    generate: protectedProcedure
        .input(
            z.object({
                responseId: z.string().uuid(),
                surveyId: z.string().uuid(),
                campaignId: z.string().uuid()
            })
        )
        .mutation(async ({input: {responseId, surveyId}}) => {
            const result = await generateAuthenticityScore(responseId, surveyId);
            return result;
        }),
    override: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                originalScore: z.number().min(0).max(100),
                overrideReason: z.string().min(1, 'reason is required')
            })
        )
        .mutation(async ({input: {id, originalScore, overrideReason}, ctx}) => {
            const {t} = await getServerI18n(ctx.locale);
            const [authenticityScore] = await ctx.db
                .update(authenticityScores)
                .set({
                    isOverridden: true,
                    overrideOriginalPercentage: originalScore,
                    overrideReason,
                    overrideUserId: ctx.user.id,
                    overrideTimestamp: new Date(),
                    percentage: originalScore,
                    updatedAt: new Date()
                })
                .where(eq(authenticityScores.id, id))
                .returning();

            if (!authenticityScore) {
                throw new Error(t('Authenticity score not found'));
            }

            return {
                ...authenticityScore,
                isPass: isAuthenticityPass(authenticityScore.percentage)
            };
        })
};

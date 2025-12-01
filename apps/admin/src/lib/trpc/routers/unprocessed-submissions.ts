import {responseSubmissions} from '@glint/database';
import {and, desc, eq, isNull} from 'drizzle-orm';
import {z} from 'zod';
import {protectedProcedure} from '../init';

export const unprocessedSubmissionsRouter = {
    getBySurvey: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const data = await ctx.db
            .select({
                createdAt: responseSubmissions.createdAt,
                failureReason: responseSubmissions.failureReason,
                id: responseSubmissions.id,
                updatedAt: responseSubmissions.updatedAt
            })
            .from(responseSubmissions)
            .where(
                and(
                    eq(responseSubmissions.surveyId, input),
                    eq(responseSubmissions.tenantId, ctx.tenant),
                    isNull(responseSubmissions.processedAt)
                )
            )
            .orderBy(desc(responseSubmissions.createdAt));

        return data;
    })
};


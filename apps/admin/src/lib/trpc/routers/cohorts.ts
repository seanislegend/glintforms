import {cohorts, respondentCohorts} from '@glint/database';
import {and, count, desc, eq} from 'drizzle-orm';
import {z} from 'zod';
import type {CohortList} from '@/lib/schemas/cohorts';
import {cohortCreateSchema, cohortUpdateSchema} from '@/lib/schemas/cohorts';
import {createTRPCRouter, protectedProcedure} from '../init';

export const cohortsRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ctx}) => {
        const rows = await ctx.db
            .select({
                id: cohorts.id,
                name: cohorts.name,
                description: cohorts.description,
                createdAt: cohorts.createdAt,
                updatedAt: cohorts.updatedAt,
                respondentCount: count(respondentCohorts.respondentId)
            })
            .from(cohorts)
            .leftJoin(respondentCohorts, eq(cohorts.id, respondentCohorts.cohortId))
            .where(eq(cohorts.tenantId, ctx.tenant))
            .groupBy(cohorts.id)
            .orderBy(desc(cohorts.createdAt));

        return rows as CohortList[];
    }),
    get: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const [cohort] = await ctx.db
            .select({
                id: cohorts.id,
                name: cohorts.name,
                description: cohorts.description,
                createdAt: cohorts.createdAt,
                updatedAt: cohorts.updatedAt
            })
            .from(cohorts)
            .where(and(eq(cohorts.id, input), eq(cohorts.tenantId, ctx.tenant)))
            .limit(1);

        if (!cohort) return null;
        return cohort;
    }),
    create: protectedProcedure.input(cohortCreateSchema).mutation(async ({ctx, input}) => {
        const [cohort] = await ctx.db
            .insert(cohorts)
            .values({
                ...input,
                tenantId: ctx.tenant
            })
            .returning();

        return cohort;
    }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                data: cohortUpdateSchema
            })
        )
        .mutation(async ({ctx, input}) => {
            const [cohort] = await ctx.db
                .update(cohorts)
                .set({
                    ...input.data,
                    updatedAt: new Date()
                })
                .where(and(eq(cohorts.id, input.id), eq(cohorts.tenantId, ctx.tenant)))
                .returning();

            if (!cohort) return null;
            return cohort;
        })
});

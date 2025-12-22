import {
    campaigns,
    cohorts,
    respondentCohorts,
    respondents,
    responses,
    surveys
} from '@glint/database';
import {and, count, desc, eq, inArray} from 'drizzle-orm';
import {z} from 'zod';
import type {CohortList} from '@/lib/schemas/cohorts';
import {cohortCreateSchema, cohortUpdateSchema} from '@/lib/schemas/cohorts';
import type {RespondentList} from '@/lib/schemas/respondents';
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
        }),
    addRespondents: protectedProcedure
        .input(
            z.object({
                cohortId: z.string().uuid(),
                respondentIds: z.array(z.string().uuid())
            })
        )
        .mutation(async ({ctx, input}) => {
            // verify cohort exists and belongs to tenant
            const [cohort] = await ctx.db
                .select({id: cohorts.id})
                .from(cohorts)
                .where(and(eq(cohorts.id, input.cohortId), eq(cohorts.tenantId, ctx.tenant)))
                .limit(1);

            if (!cohort) {
                throw new Error('Cohort not found');
            }

            if (input.respondentIds.length === 0) {
                return {added: 0, skipped: 0};
            }

            // get existing assignments to avoid duplicates
            const existing = await ctx.db
                .select({respondentId: respondentCohorts.respondentId})
                .from(respondentCohorts)
                .where(
                    and(
                        eq(respondentCohorts.cohortId, input.cohortId),
                        inArray(respondentCohorts.respondentId, input.respondentIds)
                    )
                );

            const existingIds = new Set(existing.map(e => e.respondentId));
            const newRespondentIds = input.respondentIds.filter(id => !existingIds.has(id));

            if (newRespondentIds.length > 0) {
                await ctx.db.insert(respondentCohorts).values(
                    newRespondentIds.map(respondentId => ({
                        cohortId: input.cohortId,
                        respondentId,
                        assignedBy: ctx.user.id
                    }))
                );
            }

            return {
                added: newRespondentIds.length,
                skipped: existingIds.size
            };
        }),
    getRespondents: protectedProcedure.input(z.string()).query(async ({input: cohortId, ctx}) => {
        // verify cohort exists and belongs to tenant
        const [cohort] = await ctx.db
            .select({id: cohorts.id})
            .from(cohorts)
            .where(and(eq(cohorts.id, cohortId), eq(cohorts.tenantId, ctx.tenant)))
            .limit(1);

        if (!cohort) {
            return [];
        }

        const rows = await ctx.db
            .select({
                campaignId: campaigns.id,
                campaignTitle: campaigns.title,
                cohortId: cohorts.id,
                cohortName: cohorts.name,
                email: respondents.email,
                gender: respondents.gender,
                id: respondents.id,
                name: respondents.name,
                respondentId: respondentCohorts.respondentId,
                surveyId: surveys.id,
                surveyTitle: surveys.title,
                updatedAt: respondents.updatedAt
            })
            .from(respondentCohorts)
            .innerJoin(respondents, eq(respondentCohorts.respondentId, respondents.id))
            .leftJoin(responses, eq(respondents.id, responses.respondentId))
            .leftJoin(surveys, eq(responses.surveyId, surveys.id))
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .leftJoin(cohorts, eq(respondentCohorts.cohortId, cohorts.id))
            .where(
                and(
                    eq(respondentCohorts.cohortId, cohortId),
                    eq(respondents.tenantId, ctx.tenant)
                )
            )
            .orderBy(desc(respondents.updatedAt));

        const data = Object.values(
            rows.reduce(
                (acc, row) => {
                    if (!row.respondentId) return acc;
                    if (!acc[row.respondentId]) {
                        acc[row.respondentId] = {
                            campaigns: [],
                            cohorts: [],
                            email: row.email,
                            gender: row.gender,
                            id: row.respondentId,
                            name: row.name,
                            surveys: [],
                            updatedAt: row.updatedAt
                        };
                    }
                    if (row.surveyId && acc[row.respondentId]?.surveys) {
                        const respondent = acc[row.respondentId];
                        if (!respondent || !respondent.surveys) return acc;

                        const hasSurvey = respondent.surveys.some(
                            (s: {id: string}) => s.id === row.surveyId
                        );
                        if (!hasSurvey) {
                            respondent.surveys.push({
                                campaignId: row.campaignId,
                                campaignTitle: row.campaignTitle,
                                id: row.surveyId,
                                title: row.surveyTitle ?? ''
                            });
                        }
                    }
                    if (row.cohortId && acc[row.respondentId]?.cohorts) {
                        const respondent = acc[row.respondentId];
                        if (!respondent || !respondent.cohorts) return acc;

                        const hasCohort = respondent.cohorts.some(
                            (c: {id: string}) => c.id === row.cohortId
                        );
                        if (!hasCohort) {
                            respondent.cohorts.push({
                                id: row.cohortId,
                                name: row.cohortName ?? ''
                            });
                        }
                    }
                    return acc;
                },
                {} as Record<string, RespondentList>
            )
        );

        return data;
    })
});

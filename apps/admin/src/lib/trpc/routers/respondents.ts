import {authenticityScores, campaigns, respondents, responses, surveys} from '@glint/database';
import {and, desc, eq, sql} from 'drizzle-orm';
import {z} from 'zod';
import type {RespondentList} from '@/lib/schemas/respondents';
import {protectedProcedure} from '../init';

export const respondentsRouter = {
    getAll: protectedProcedure.query(async ({ctx}) => {
        const rows = await ctx.db
            .select({
                id: respondents.id,
                name: respondents.name,
                email: respondents.email,
                gender: respondents.gender,
                updatedAt: respondents.updatedAt,
                surveyId: surveys.id,
                surveyTitle: surveys.title,
                campaignId: campaigns.id,
                campaignTitle: campaigns.title
            })
            .from(respondents)
            .leftJoin(responses, eq(respondents.id, responses.respondentId))
            .leftJoin(surveys, eq(responses.surveyId, surveys.id))
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .where(eq(respondents.tenantId, ctx.tenant))
            .orderBy(desc(respondents.updatedAt));

        const data = Object.values(
            rows.reduce(
                (acc, row) => {
                    if (!acc[row.id]) {
                        acc[row.id] = {...row, surveys: []};
                    }
                    if (row.surveyId && acc[row.id] && acc[row.id]?.surveys) {
                        const respondent = acc[row.id];
                        if (!respondent || !respondent.surveys) return acc;

                        const hasSurvey = respondent.surveys.some(
                            (s: {id: string}) => s.id === row.surveyId
                        );
                        if (!hasSurvey) {
                            respondent.surveys.push({
                                id: row.surveyId,
                                title: row.surveyTitle ?? '',
                                campaignId: row.campaignId,
                                campaignTitle: row.campaignTitle
                            });
                        }
                    }
                    return acc;
                },
                {} as Record<string, RespondentList>
            )
        );

        return data;
    }),
    get: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const [data] = await ctx.db
            .select()
            .from(respondents)
            .where(and(eq(respondents.id, input), eq(respondents.tenantId, ctx.tenant)))
            .limit(1);
        return data || null;
    }),
    getProfile: protectedProcedure.input(z.string()).query(async ({input: respondentId, ctx}) => {
        const [respondentData] = await ctx.db
            .select()
            .from(respondents)
            .where(and(eq(respondents.id, respondentId), eq(respondents.tenantId, ctx.tenant)))
            .limit(1);
        const respondent = respondentData;
        if (!respondent) return null;

        const surveysData = await ctx.db
            .select({
                id: surveys.id,
                title: surveys.title,
                responseCount: sql<number>`count(${responses.id})`,
                campaignId: campaigns.id,
                campaignTitle: campaigns.title,
                campaignDescription: campaigns.description,
                campaignIsActive: campaigns.isActive,
                campaignCreatedAt: campaigns.createdAt
            })
            .from(surveys)
            .innerJoin(responses, eq(surveys.id, responses.surveyId))
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .where(eq(responses.respondentId, respondentId))
            .groupBy(
                surveys.id,
                surveys.title,
                campaigns.id,
                campaigns.title,
                campaigns.description,
                campaigns.isActive,
                campaigns.createdAt
            );
        const [authenticityData] = await ctx.db
            .select({
                avgScore: sql<number>`avg(${authenticityScores.percentage})`,
                totalResponses: sql<number>`count(${authenticityScores.id})`
            })
            .from(authenticityScores)
            .innerJoin(responses, eq(authenticityScores.responseId, responses.id))
            .where(eq(responses.respondentId, respondentId));
        const avgAuthenticityScore = authenticityData?.avgScore || 0;
        const totalResponsesWithScores = authenticityData?.totalResponses || 0;

        return {
            ...respondent,
            surveys: surveysData,
            avgAuthenticityScore: Math.round(avgAuthenticityScore),
            totalResponsesWithScores
        };
    }),
    create: protectedProcedure
        .input(
            z.object({
                email: z.string().email(),
                name: z.string().min(1),
                notes: z.string().optional(),
                signupSource: z.string().optional()
            })
        )
        .mutation(async ({input, ctx}) => {
            const [newRespondent] = await ctx.db
                .insert(respondents)
                .values({
                    email: input.email,
                    name: input.name,
                    notes: input.notes,
                    signupSource: input.signupSource,
                    tenantId: ctx.tenant
                })
                .returning();
            return newRespondent;
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                email: z.string().email().optional(),
                name: z.string().min(1).optional(),
                notes: z.string().optional(),
                signupSource: z.string().optional()
            })
        )
        .mutation(async ({input, ctx}) => {
            const {id, ...updateData} = input;
            const [updatedRespondent] = await ctx.db
                .update(respondents)
                .set(updateData)
                .where(and(eq(respondents.id, id), eq(respondents.tenantId, ctx.tenant)))
                .returning();
            return updatedRespondent;
        })
};

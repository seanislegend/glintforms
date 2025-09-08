import {campaigns, respondents, surveys} from '@glint/database';
import {and, eq} from 'drizzle-orm';
import {z} from 'zod';
import {createTRPCRouter, protectedProcedure} from '../init';

const breadcrumbDataSchema = z.object({
    campaigns: z.string().nullable(),
    respondents: z.string().nullable(),
    surveys: z.string().nullable()
});

export const breadcrumbsRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(z.object({routeSegments: z.record(z.string(), z.array(z.string()))}))
        .output(breadcrumbDataSchema)
        .query(async ({ctx, input}) => {
            const {routeSegments} = input;
            const result: z.infer<typeof breadcrumbDataSchema> = {
                campaigns: null,
                respondents: null,
                surveys: null
            };

            if (
                routeSegments.campaigns &&
                Array.isArray(routeSegments.campaigns) &&
                routeSegments.campaigns.length > 0
            ) {
                const campaignId = routeSegments.campaigns[0];
                if (campaignId) {
                    const [campaign] = await ctx.db
                        .select({name: campaigns.title})
                        .from(campaigns)
                        .where(
                            and(eq(campaigns.id, campaignId), eq(campaigns.tenantId, ctx.tenant))
                        );
                    result.campaigns = campaign?.name ?? null;
                }
            }

            if (
                routeSegments.respondents &&
                Array.isArray(routeSegments.respondents) &&
                routeSegments.respondents.length > 0
            ) {
                const respondentId = routeSegments.respondents[0];
                if (respondentId) {
                    const [respondent] = await ctx.db
                        .select({name: respondents.name})
                        .from(respondents)
                        .where(
                            and(
                                eq(respondents.id, respondentId),
                                eq(respondents.tenantId, ctx.tenant)
                            )
                        );
                    result.respondents = respondent?.name ?? null;
                }
            }

            if (
                routeSegments.surveys &&
                Array.isArray(routeSegments.surveys) &&
                routeSegments.surveys.length > 0
            ) {
                const surveyId = routeSegments.surveys[0];
                if (surveyId) {
                    const [survey] = await ctx.db
                        .select({title: surveys.title})
                        .from(surveys)
                        .where(and(eq(surveys.id, surveyId), eq(surveys.tenantId, ctx.tenant)));
                    result.surveys = survey?.title ?? null;
                }
            }

            return result;
        })
});

import {campaigns, cohorts, surveys} from '@glint/database';
import {desc, eq} from 'drizzle-orm';
import {protectedProcedure} from '../init';

export const navRouter = {
    getAll: protectedProcedure.query(async ({ctx}) => {
        const latestCampaigns = await ctx.db
            .select({id: campaigns.id, title: campaigns.title})
            .from(campaigns)
            .where(eq(campaigns.tenantId, ctx.tenant))
            .orderBy(desc(campaigns.createdAt))
            .limit(5);
        const latestSurveys = await ctx.db
            .select({id: surveys.id, slug: surveys.slug, title: surveys.title})
            .from(surveys)
            .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
            .orderBy(desc(surveys.createdAt))
            .where(eq(surveys.tenantId, ctx.tenant))
            .limit(5);

        const latestCohorts = await ctx.db
            .select({id: cohorts.id, name: cohorts.name})
            .from(cohorts)
            .where(eq(cohorts.tenantId, ctx.tenant))
            .orderBy(desc(cohorts.createdAt))
            .limit(5);

        return {
            campaigns: latestCampaigns,
            cohorts: latestCohorts,
            surveys: latestSurveys
        };
    })
};

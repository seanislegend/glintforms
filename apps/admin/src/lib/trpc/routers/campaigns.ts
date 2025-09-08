import {campaigns} from '@glint/database';
import {desc, eq} from 'drizzle-orm';
import {z} from 'zod';
import {protectedProcedure} from '../init';

export const campaignsRouter = {
    getAll: protectedProcedure.query(async ({ctx}) => {
        const data = await ctx.db
            .select()
            .from(campaigns)
            .orderBy(desc(campaigns.createdAt))
            .where(eq(campaigns.tenantId, ctx.tenant));
        return data;
    }),
    create: protectedProcedure
        .input(z.object({title: z.string()}))
        .mutation(async ({input, ctx}) => {
            const [newCampaign] = await ctx.db
                .insert(campaigns)
                .values({
                    title: input.title,
                    tenantId: ctx.tenant
                })
                .returning();
            return newCampaign;
        })
};

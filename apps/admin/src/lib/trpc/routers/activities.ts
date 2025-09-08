import {activities} from '@glint/database';
import {desc, eq} from 'drizzle-orm';
import {createInsertSchema} from 'drizzle-zod';
import {z} from 'zod';
import {protectedProcedure} from '../init';

export const activitiesRouter = {
    create: protectedProcedure
        .input(createInsertSchema(activities))
        .mutation(async ({input, ctx}) => {
            await ctx.db.insert(activities).values({...input, userId: ctx.user.id});
        }),
    getAll: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const data = await ctx.db
            .select()
            .from(activities)
            .where(eq(activities.surveyId, input))
            .orderBy(desc(activities.createdAt))
            .limit(6);

        return data;
    })
};

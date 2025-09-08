import {z} from 'zod';
import {protectedProcedure} from '../init';

export const actionsRouter = {
    getAll: protectedProcedure.input(z.string()).query(async ({input}) => {
        // const data = await db
        //     .select()
        //     .from(surveys)
        //     .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
        //     .where(and(eq(surveys.id, input), eq(surveys.userId, ctx.user.id)));

        const data = [
            {
                ctaLabel: 'Update questions',
                ctaUrl: `/surveys/${input}/questions`,
                date: new Date(),
                id: '1',
                text: 'Your survey is still in draft mode. Complete questions so you can launch it.'
            }
        ];

        return data;
    })
};

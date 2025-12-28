import {
    screeners,
    surveyScreeners,
    surveys,
    type Database
} from '@glint/database';
import {and, count, desc, eq} from 'drizzle-orm';
import {z} from 'zod';
import type {ScreenerList} from '@/lib/schemas/screeners';
import {screenerCreateSchema, screenerUpdateSchema} from '@/lib/schemas/screeners';
import {createTRPCRouter, protectedProcedure} from '../init';

async function verifyScreenerAccess(
    db: Database,
    tenant: string,
    screenerId: string
): Promise<{id: string} | null> {
    const [screener] = await db
        .select({id: screeners.id})
        .from(screeners)
        .where(and(eq(screeners.id, screenerId), eq(screeners.tenantId, tenant)))
        .limit(1);
    return screener ?? null;
}

export const screenersRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ctx}) => {
        const rows = await ctx.db
            .select({
                config: screeners.config,
                createdAt: screeners.createdAt,
                description: screeners.description,
                id: screeners.id,
                name: screeners.name,
                type: screeners.type,
                updatedAt: screeners.updatedAt,
                surveyCount: count(surveyScreeners.screenerId)
            })
            .from(screeners)
            .leftJoin(surveyScreeners, eq(screeners.id, surveyScreeners.screenerId))
            .where(eq(screeners.tenantId, ctx.tenant))
            .groupBy(screeners.id)
            .orderBy(desc(screeners.createdAt));

        return rows as ScreenerList[];
    }),
    get: protectedProcedure.input(z.string()).query(async ({input, ctx}) => {
        const [screener] = await ctx.db
            .select({
                config: screeners.config,
                createdAt: screeners.createdAt,
                description: screeners.description,
                id: screeners.id,
                name: screeners.name,
                type: screeners.type,
                updatedAt: screeners.updatedAt
            })
            .from(screeners)
            .where(and(eq(screeners.id, input), eq(screeners.tenantId, ctx.tenant)))
            .limit(1);

        if (!screener) return null;

        // get surveys using this screener
        const surveyRows = await ctx.db
            .select({
                failureMessage: surveyScreeners.failureMessage,
                id: surveys.id,
                order: surveyScreeners.order,
                title: surveys.title
            })
            .from(surveyScreeners)
            .innerJoin(surveys, eq(surveyScreeners.surveyId, surveys.id))
            .where(
                and(
                    eq(surveyScreeners.screenerId, screener.id),
                    eq(surveys.tenantId, ctx.tenant)
                )
            )
            .orderBy(surveyScreeners.order);

        return {
            ...screener,
            surveys: surveyRows
        };
    }),
    create: protectedProcedure.input(screenerCreateSchema).mutation(async ({ctx, input}) => {
        const {config, description, name, type} = input;
        const [screener] = await ctx.db
            .insert(screeners)
            .values({
                config: config as Record<string, unknown>,
                description,
                name,
                tenantId: ctx.tenant,
                type
            })
            .returning();

        return screener;
    }),
    update: protectedProcedure
        .input(
            z.object({
                data: screenerUpdateSchema,
                id: z.string().uuid()
            })
        )
        .mutation(async ({ctx, input}) => {
            const screener = await verifyScreenerAccess(ctx.db, ctx.tenant, input.id);
            if (!screener) {
                throw new Error('Screener not found');
            }

            const updateData: {
                config?: Record<string, unknown>;
                description?: string;
                name?: string;
                type?: string;
                updatedAt: Date;
            } = {
                updatedAt: new Date()
            };

            if (input.data.name !== undefined) {
                updateData.name = input.data.name;
            }
            if (input.data.description !== undefined) {
                updateData.description = input.data.description;
            }
            if (input.data.type !== undefined) {
                updateData.type = input.data.type;
            }
            if (input.data.config !== undefined) {
                updateData.config = input.data.config as Record<string, unknown>;
            }

            const [updated] = await ctx.db
                .update(screeners)
                .set(updateData)
                .where(and(eq(screeners.id, input.id), eq(screeners.tenantId, ctx.tenant)))
                .returning();

            if (!updated) return null;
            return updated;
        }),
    delete: protectedProcedure.input(z.string().uuid()).mutation(async ({ctx, input}) => {
        const screener = await verifyScreenerAccess(ctx.db, ctx.tenant, input);
        if (!screener) {
            throw new Error('Screener not found');
        }

        // check if screener is used in any surveys
        const [usage] = await ctx.db
            .select({count: count()})
            .from(surveyScreeners)
            .where(eq(surveyScreeners.screenerId, input))
            .limit(1);

        if (usage && usage.count > 0) {
            throw new Error('Cannot delete screener that is assigned to surveys');
        }

        await ctx.db
            .delete(screeners)
            .where(and(eq(screeners.id, input), eq(screeners.tenantId, ctx.tenant)));

        return {success: true};
    })
});


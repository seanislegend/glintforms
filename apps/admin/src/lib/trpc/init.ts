import {db, surveys, user} from '@glint/database';
import {initTRPC, TRPCError} from '@trpc/server';
import {and, eq} from 'drizzle-orm';
import superjson from 'superjson';
import z, {ZodError} from 'zod';
import {auth} from '@/lib/auth/server';
import {surveyCanBeEdited} from '@/lib/surveys/status';

export const createTRPCContext = async (opts: {headers: Headers}) => {
    const session = await auth.api.getSession({headers: opts.headers});
    let tenant = null;

    if (session?.user?.id) {
        const userData = await db
            .select({tenantId: user.tenantId})
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);
        tenant = userData[0]?.tenantId || null;
    }

    return {db, session, tenant, user: session?.user};
};

export const t = initTRPC.context<typeof createTRPCContext>().create({
    errorFormatter: ({shape, error}) => ({
        ...shape,
        data: {
            ...shape.data,
            zodError:
                error.cause instanceof ZodError
                    ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
                    : null
        }
    }),
    transformer: superjson
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ctx, next}) => {
    if (!ctx.user || !ctx.tenant) {
        throw new TRPCError({code: 'UNAUTHORIZED'});
    }
    return next({
        ctx: {...ctx, tenant: ctx.tenant, user: ctx.user}
    });
});

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const surveyEditableProcedure = protectedProcedure.use(async ({ctx, input, next}) => {
    // extract survey id from input
    // input is raw before validation, so we need to handle it carefully
    // only check if input is a record - let input validation handle other cases
    if (!isRecord(input)) {
        // input is not a record, let input validation handle the error
        return next({ctx});
    }

    const surveyId = typeof input.surveyId === 'string' ? input.surveyId : null;
    if (!surveyId) {
        // no surveyId in input, let input validation handle the error
        return next({ctx});
    }

    // fetch survey and check if it can be edited
    const [survey] = await ctx.db
        .select({status: surveys.status})
        .from(surveys)
        .where(and(eq(surveys.id, surveyId), eq(surveys.tenantId, ctx.tenant)))
        .limit(1);
    if (!survey) {
        throw new TRPCError({code: 'NOT_FOUND', message: 'Survey not found'});
    }

    if (!surveyCanBeEdited(survey.status)) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot modify survey when it is complete or archived'
        });
    }

    return next({ctx});
});

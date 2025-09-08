import {db, user} from '@glint/database';
import {initTRPC, TRPCError} from '@trpc/server';
import {eq} from 'drizzle-orm';
import superjson from 'superjson';
import z, {ZodError} from 'zod';
import {auth} from '@/lib/auth/server';

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

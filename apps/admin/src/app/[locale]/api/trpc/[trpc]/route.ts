import {fetchRequestHandler} from '@trpc/server/adapters/fetch';
import type {NextRequest} from 'next/server';
import {createTRPCContext} from '@/lib/trpc/init';
import {appRouter} from '@/lib/trpc/routers/app';

const setCorsHeaders = (res: Response) => {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Request-Method', '*');
    res.headers.set('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.headers.set('Access-Control-Allow-Headers', '*');
};

export const OPTIONS = () => {
    const response = new Response(null, {status: 204});
    setCorsHeaders(response);
    return response;
};

const handler = async (req: NextRequest, ctx: RouteContext<'/[locale]/api/trpc/[trpc]'>) => {
    const params = await ctx.params;
    const locale = params.locale as Locale;
    const response = await fetchRequestHandler({
        endpoint: `/${locale}/api/trpc`,
        router: appRouter,
        req,
        createContext: () => createTRPCContext({headers: req.headers, locale}),
        onError({error, path}) {
            console.error(`>>> tRPC Error on '${path}'`, error);
        }
    });

    setCorsHeaders(response);
    return response;
};

export {handler as GET, handler as POST};

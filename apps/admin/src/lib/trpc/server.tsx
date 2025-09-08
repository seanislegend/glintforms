import 'server-only';
import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import type {TRPCQueryOptions} from '@trpc/tanstack-react-query';
import {createTRPCOptionsProxy} from '@trpc/tanstack-react-query';
import {headers} from 'next/headers';
import {cache} from 'react';
import {createTRPCContext} from '@/lib/trpc/init';
import type {AppRouter} from '@/lib/trpc/routers/app';
import {appRouter} from '@/lib/trpc/routers/app';
import {createQueryClient} from './query-client';

// this wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
// handling a tRPC call from a React Server Component.
const createContext = cache(async () => {
    const heads = new Headers(await headers());
    heads.set('x-trpc-source', 'rsc');
    return createTRPCContext({headers: heads});
});

const getQueryClient = cache(createQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
    ctx: createContext,
    queryClient: getQueryClient,
    router: appRouter
});

export const HydrateClient = (props: {children: React.ReactNode}) => {
    const queryClient = getQueryClient();
    return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prefetch = <T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) => {
    const queryClient = getQueryClient();
    if (queryOptions.queryKey[1]?.type === 'infinite') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        void queryClient.prefetchInfiniteQuery(queryOptions as any);
    } else {
        void queryClient.prefetchQuery(queryOptions);
    }
};

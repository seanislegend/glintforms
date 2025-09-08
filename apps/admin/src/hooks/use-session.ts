'use client';

import {createAuthClient} from 'better-auth/react';

const {useSession: useSessionClient} = createAuthClient();

const useSession = () => {
    const {data: session, isPending, error, refetch} = useSessionClient();
    return {session, isPending, error, refetch};
};

export {useSession};

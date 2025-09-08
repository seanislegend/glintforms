import {headers} from 'next/headers';
import {cache} from 'react';
import {initAuth} from '@/lib/auth/index';

export const getSession = cache(async () => {
    return auth.api.getSession({headers: await headers()});
});

export const auth = initAuth();

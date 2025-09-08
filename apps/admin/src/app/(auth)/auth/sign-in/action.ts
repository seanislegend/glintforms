'use server';

import * as Sentry from '@sentry/nextjs';
import {authClient} from '@/lib/auth/client';

export const handleSubmit = async (
    _prevState: {error: string | null; success: boolean},
    formData: FormData
) => {
    const email = formData.get('email') as string;
    if (!email) {
        return {success: false, error: 'Email is required'};
    }

    const {data, error} = await authClient.signIn.magicLink({email, callbackURL: '/'});
    if (error) {
        Sentry.captureMessage('auth error', {
            tags: {action: 'sign_in_magic_link'},
            extra: {error}
        });

        return {success: false, error: error.message ?? 'An unknown error occurred'};
    }

    if (data?.status === true) {
        return {success: true, error: null};
    }

    return {success: false, error: null};
};

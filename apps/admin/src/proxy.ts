import {headers} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {auth} from './lib/auth/server';

export const proxy = async (request: NextRequest) => {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        // don't redirect to sign-in if the user is on the sign-in page
        if (request.nextUrl.pathname !== '/auth/sign-in') {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url));
        }
    }

    return NextResponse.next();
};

export const config = {
    runtime: 'nodejs',
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

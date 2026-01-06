import {match as matchLocale} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {headers} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {i18n} from './i18n-config';
import {auth} from './lib/auth/server';

const getLocale = (request: NextRequest): string | undefined => {
    // negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        negotiatorHeaders[key] = value;
    });

    const locales = Array.from(i18n.locales);
    // use negotiator and intl-localematcher to get best locale
    const languages = new Negotiator({headers: negotiatorHeaders}).languages(locales);
    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale;
};

export const proxy = async (request: NextRequest) => {
    const headersValue = await headers();
    const session = await auth.api.getSession({headers: headersValue});

    if (!session) {
        // don't redirect to sign-in if the user is on the sign-in page
        if (request.nextUrl.pathname !== '/auth/sign-in') {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url));
        }
    }

    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = i18n.locales.every(
        locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        // e.g. incoming request is /surveys
        // the new URL is now /en-GB/surveys
        return NextResponse.redirect(
            new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
        );
    }

    return NextResponse.next();
};

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

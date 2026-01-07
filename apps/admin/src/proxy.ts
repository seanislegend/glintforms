import {match as matchLocale} from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import {headers} from 'next/headers';
import {type NextRequest, NextResponse} from 'next/server';
import {i18n, type Locale} from '@glint/translations';
import {auth} from './lib/auth/server';

const getLocale = (request: NextRequest): Locale => {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        negotiatorHeaders[key] = value;
    });

    const locales = Array.from(i18n.locales);
    const languages = new Negotiator({headers: negotiatorHeaders}).languages(locales);
    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale as Locale;
};

const extractLocaleFromPath = (pathname: string): Locale | null => {
    const segments = pathname.split('/');
    const candidate = segments[1];

    return candidate && i18n.locales.includes(candidate as Locale) ? (candidate as Locale) : null;
};

export const proxy = async (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;
    const localeFromPath = extractLocaleFromPath(pathname);

    // redirect if locale is missing from path
    if (!localeFromPath) {
        const locale = getLocale(request);
        return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
    }

    // check session and redirect to sign-in if needed
    const headersValue = await headers();
    const session = await auth.api.getSession({headers: headersValue});

    if (!session) {
        const signInPath = `/${localeFromPath}/auth/sign-in`;
        if (pathname !== signInPath) {
            return NextResponse.redirect(new URL(signInPath, request.url));
        }
    }

    // forward locale in header for tRPC context
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-trpc-locale', localeFromPath);
    return NextResponse.next({request: {headers: requestHeaders}});
};

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

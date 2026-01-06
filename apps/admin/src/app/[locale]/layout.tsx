import type {Metadata} from 'next';
import './global.css';
import {Toaster} from '@glint/ui/sonner';
import {cn} from '@glint/ui/utils';
import {GeistMono} from 'geist/font/mono';
import {GeistSans} from 'geist/font/sans';
import AppProviders from '@/components/providers';
import {i18n, type Locale} from '@/i18n-config';

export const metadata: Metadata = {
    title: 'Glint - An AI-assisted survey platform',
    description:
        'Data points that shine, insights that catch the eye. Build, deploy and analyse surveys with AI assistance.',
    keywords: ['research', 'surveys', 'ai', 'data collection'],
    authors: [{name: 'Glint Team'}]
};

export const generateStaticParams = () => {
    return i18n.locales.map(locale => ({locale}));
};

interface Props {
    params: Promise<{locale: Locale}>;
}

const RootLayout: React.FC<React.PropsWithChildren<Props>> = async ({children, params}) => {
    const {locale} = await params;

    return (
        <html
            className={cn('antialiased bg-sidebar', GeistSans.variable, GeistMono.variable)}
            lang={locale}
        >
            <head>
                {process.env.NEXT_PUBLIC_ENABLE_REACT_SCAN === '1' && (
                    <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
                )}
            </head>
            <body className="bg-sidebar text-blue-900">
                <div className="min-h-screen">
                    <AppProviders>{children}</AppProviders>
                </div>
                <Toaster richColors />
            </body>
        </html>
    );
};

export default RootLayout;

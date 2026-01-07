import type {Metadata} from 'next';
import './global.css';
import {Toaster} from '@glint/ui/sonner';
import {cn} from '@glint/ui/utils';
import {GeistMono} from 'geist/font/mono';
import {GeistSans} from 'geist/font/sans';
import AppProviders from '@/components/providers';
import {I18nProvider} from '@/components/providers/i18n-provider';
import {getLocale} from '@/get-locales';
import {i18n, type Locale} from '@glint/translations';
import {getServerI18n} from '@/lib/i18n-server';

interface Props {
    params: Promise<{locale: Locale}>;
}

export const generateMetadata = async ({params}: Props): Promise<Metadata> => {
    const {locale} = await params;
    const {t} = await getServerI18n(locale);
    const meta = {
        title: t('Glint - An AI-assisted survey platform'),
        description: t(
            'Data points that shine, insights that catch the eye. Build, deploy and analyse surveys with AI assistance.'
        ),
        keywords: [t('research'), t('surveys'), t('ai'), t('data collection')],
        authors: [{name: t('Glint Team')}]
    };

    return meta;
};

export const generateStaticParams = () => {
    return i18n.locales.map(locale => ({locale}));
};

const RootLayout: React.FC<React.PropsWithChildren<Props>> = async ({children, params}) => {
    const {locale} = await params;
    const translations = await getLocale(locale);

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
                    <I18nProvider locale={locale} translations={translations}>
                        <AppProviders locale={locale}>{children}</AppProviders>
                    </I18nProvider>
                </div>
                <Toaster richColors />
            </body>
        </html>
    );
};

export default RootLayout;

'use client';

import {createContext, type ReactNode, useContext, useMemo} from 'react';
import type {Locale} from '@glint/translations';
import {loadLocale, setLocale, t as tBase} from '@/lib/i18n';

interface I18nContextValue {
    locale: Locale;
    t: (text: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
};

interface I18nProviderProps {
    children: ReactNode;
    locale: Locale;
    translations: Record<string, string>;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({children, locale, translations}) => {
    // initialize locale synchronously before render to prevent hydration mismatch
    useMemo(() => {
        loadLocale(locale, translations);
        setLocale(locale);
    }, [locale, translations]);

    // wrapper to accept any string
    const t = (text: string): string => tBase(text as any);

    return <I18nContext.Provider value={{locale, t}}>{children}</I18nContext.Provider>;
};

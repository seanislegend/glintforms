import 'server-only';
import enTranslations from '@/../locales/en.json';
import {getLocale} from '@/get-locales';
import type {Locale} from '@/i18n-config';

// create reverse lookup: text -> key (from english translations)
const textToKeyMap: Record<string, string> = {};
for (const [key, text] of Object.entries(enTranslations)) {
    textToKeyMap[text] = key;
}

export const getServerI18n = async (locale: Locale) => {
    const translations = locale === 'en' ? enTranslations : await getLocale(locale);

    const t = (text: string): string => {
        // todo: consider if code is primary source of truth or translations are
        if (locale === 'en') {
            return text;
        }

        const key = textToKeyMap[text];

        if (!key) {
            // no key found, return the input text
            return text;
        }

        return translations[key as keyof typeof translations] || `${text} (not found)`;
    };

    return {locale, t};
};

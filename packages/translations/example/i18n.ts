/**
 * Example i18n implementation
 *
 * This shows how to integrate the translation-cli with your application.
 * After running `bun translation extract`, import the generated TranslationKey type.
 */

// After running extract, you can import the generated types:
// import type { TranslationKey } from '@/locales/keys';

// For now, we use string as the type
type TranslationKey = string;

// Load locale files (in real app, this would be dynamic)
const translations: Record<string, Record<string, string>> = {
    en: {
        // populated by translation CLI
    },
    fr: {
        // populated by translation CLI or manual translation
    }
};

let currentLocale = 'en';

/**
 * Translation function with type safety
 * @param key - Translation key (autocomplete provided by TypeScript)
 * @returns Translated string for current locale
 */
export const t = (key: TranslationKey): string => {
    const translation = translations[currentLocale]?.[key];

    if (!translation) {
        console.warn(`Missing translation for key: ${key} (locale: ${currentLocale})`);
        return key;
    }

    return translation;
};

/**
 * Set the current locale
 * @param locale - Locale code (e.g., 'en', 'fr', 'es')
 */
export const setLocale = (locale: string): void => {
    if (!translations[locale]) {
        console.warn(`Locale not found: ${locale}`);
        return;
    }
    currentLocale = locale;
};

/**
 * Get the current locale
 */
export const getLocale = (): string => {
    return currentLocale;
};

/**
 * Get available locales
 */
export const getAvailableLocales = (): string[] => {
    return Object.keys(translations);
};

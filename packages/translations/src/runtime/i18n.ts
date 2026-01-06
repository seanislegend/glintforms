// translations storage - populated by createTranslations()
let translations: Record<string, Record<string, string>> = {};
let textToKeyMap: Record<string, string> = {};
let currentLocale = 'en';

/**
 * Initialize translations with locale data
 * @param localeData - Translation data for primary locale
 * @param locale - Locale code (default: 'en')
 */
export const initTranslations = (localeData: Record<string, string>, locale = 'en'): void => {
    translations = {
        [locale]: localeData,
    };
    
    // create reverse lookup: text -> key
    textToKeyMap = {};
    for (const [key, text] of Object.entries(localeData)) {
        textToKeyMap[text] = key;
    }
    
    currentLocale = locale;
};

/**
 * Translation function with type safety
 * 
 * Accepts original text strings only.
 * Autocomplete shows all extracted text strings, not internal key names.
 * 
 * @example
 * ```ts
 * t('All campaigns')
 * t('Last updated')
 * t('Welcome back')
 * ```
 * 
 * @param text - Original text string to translate
 * @returns Translated string for current locale
 */
export const t = <T extends string = string>(text: T): string => {
    const currentTranslations = translations[currentLocale];
    
    if (!currentTranslations) {
        return text;
    }

    // check if it's a valid key
    if (text in currentTranslations) {
        return currentTranslations[text] || text;
    }

    // try to find by original text
    const key = textToKeyMap[text];
    if (key && key in currentTranslations) {
        return currentTranslations[key] || text;
    }

    // fallback: return the input
    if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation not found: "${text}" (locale: ${currentLocale})`);
    }
    return text;
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

/**
 * Load additional locale at runtime
 * @param locale - Locale code
 * @param translations - Translation key-value pairs
 */
export const loadLocale = (locale: string, localeTranslations: Record<string, string>): void => {
    translations[locale] = localeTranslations;
};


import {
    getAvailableLocales,
    getLocale,
    initTranslations,
    loadLocale,
    setLocale,
    t as tBase
} from '@glint/translations';
import enTranslations from '../../locales/en.json';
import type {TranslationKey, TranslationText} from '../../locales/keys';

initTranslations(enTranslations, 'en');

/**
 * Type-safe translation function
 *
 * Provides autocomplete for original text strings only.
 * Hover over any text to see all file locations where it's used.
 *
 * @example
 * ```ts
 * t('All campaigns')
 * t('Last updated')
 * t('Welcome back')
 * ```
 */
export const t = (text: TranslationText): string => tBase(text);

export {getAvailableLocales, getLocale, loadLocale, setLocale};
export type {TranslationKey, TranslationText};

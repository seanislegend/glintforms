import 'server-only';
import {i18n, type Locale} from './i18n-config';

const locales = {
    en: () => import('@/../locales/en.json'),
    es: () => import('@/../locales/es.json')
} as const;

export const getLocale = async (locale: string | Locale) => {
    // validate locale and fallback to default if invalid
    const validLocale = (
        i18n.locales.includes(locale as Locale) ? locale : i18n.defaultLocale
    ) as Locale;
    const loader = locales[validLocale];
    if (!loader) {
        throw new Error(`Locale ${validLocale} not found`);
    }
    const module = await loader();
    // handle both default export and direct export
    return (module.default || module) as Record<string, string>;
};

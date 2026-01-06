import 'server-only';
import type {Locale} from './i18n-config';

const locales = {
    en: () => import('../locales/en.json'),
    es: () => import('../locales/es.json')
} as const;

export const getLocale = async (locale: Locale) => {
    const loader = locales[locale as keyof typeof locales];
    if (!loader) {
        throw new Error(`Locale ${locale} not found`);
    }
    const module = await loader();
    // handle both default export and direct export
    return (module.default || module) as Record<string, string>;
};

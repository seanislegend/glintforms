import 'server-only';
import {loadServerLocale, type LocaleLoaders} from '@glint/translations/server';
import {i18n, type Locale} from '@glint/translations';

const locales: LocaleLoaders<Locale> = {
    en: () => import('@/../locales/en.json'),
    es: () => import('@/../locales/es.json')
} as const;

export const getLocale = async (locale: string | Locale) => {
    return loadServerLocale(locale, i18n, locales);
};

import {i18n, type Locale} from '@glint/translations';
import {createServerI18n, type LocaleLoaders} from '@glint/translations/server';
import enTranslations from '@/../locales/en.json';

const locales: LocaleLoaders<Locale> = {
    en: () => import('@/../locales/en.json'),
    es: () => import('@/../locales/es.json')
} as const;

export const getServerI18n = createServerI18n({
    config: i18n,
    loaders: locales,
    primaryTranslations: enTranslations
});

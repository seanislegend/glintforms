import {DEFAULT_LOCALE, LOCALES} from '@glint/translations/constants';

export const i18n = {
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES
} as const;

export type Locale = (typeof i18n)['locales'][number];

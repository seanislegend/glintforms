import type {I18nConfig} from './server.js';

export const createI18nConfig = <Locale extends string>(
    locales: readonly Locale[],
    defaultLocale: Locale = locales[0] as Locale
): I18nConfig<Locale> => ({
    defaultLocale,
    locales
});

export type LocaleFromConfig<Config extends I18nConfig<string>> = Config['locales'][number];

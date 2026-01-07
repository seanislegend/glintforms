import 'server-only';

export interface I18nConfig<Locale extends string> {
    defaultLocale: Locale;
    locales: readonly Locale[];
}

export type LocaleLoader = () => Promise<
    Record<string, string> | {default: Record<string, string>}
>;

export interface LocaleLoaders<Locale extends string> {
    [key: string]: LocaleLoader;
}

export interface ServerI18nResult<Locale extends string> {
    locale: Locale;
    t: (text: string) => string;
}

const createTextToKeyMap = (translations: Record<string, string>): Record<string, string> => {
    const map: Record<string, string> = {};
    for (const [key, text] of Object.entries(translations)) {
        map[text] = key;
    }
    return map;
};

export const loadServerLocale = async <Locale extends string>(
    locale: string | Locale,
    config: I18nConfig<Locale>,
    loaders: LocaleLoaders<Locale>
): Promise<Record<string, string>> => {
    const validLocale = (
        config.locales.includes(locale as Locale) ? locale : config.defaultLocale
    ) as Locale;

    const loader = loaders[validLocale];
    if (!loader) {
        throw new Error(`Locale ${validLocale} not found`);
    }

    const module = await loader();
    return ('default' in module ? module.default : module) as Record<string, string>;
};

export const createServerI18n = <Locale extends string>(options: {
    config: I18nConfig<Locale>;
    loaders: LocaleLoaders<Locale>;
    primaryTranslations: Record<string, string>;
}) => {
    const {config, loaders, primaryTranslations} = options;
    const textToKeyMap = createTextToKeyMap(primaryTranslations);

    return async (localeValue: Locale | string | null): Promise<ServerI18nResult<Locale>> => {
        const locale = (localeValue || config.defaultLocale) as Locale;
        const translations =
            locale === config.defaultLocale
                ? primaryTranslations
                : await loadServerLocale(locale, config, loaders);

        const t = (text: string): string => {
            if (locale === config.defaultLocale) {
                return text;
            }

            const key = textToKeyMap[text];
            if (!key) {
                return text;
            }

            return translations[key as keyof typeof translations] || `${text} (not found)`;
        };

        return {locale, t};
    };
};

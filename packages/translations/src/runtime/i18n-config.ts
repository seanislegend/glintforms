import {createI18nConfig, type LocaleFromConfig} from './config.js';

export const i18n = createI18nConfig(['en', 'es'] as const, 'en');

export type Locale = LocaleFromConfig<typeof i18n>;


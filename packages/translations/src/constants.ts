import {loadConfig} from './config.js';

// load config at build time
const config = await loadConfig();

export const LOCALES = config.locales;
export const DEFAULT_LOCALE = config.primaryLocale;

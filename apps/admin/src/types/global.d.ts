import type {i18n} from '@/i18n-config';

declare global {
    // make Locale type globally available
    type Locale = (typeof i18n)['locales'][number];
}

export {};


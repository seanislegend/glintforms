import type {i18n} from '@glint/translations';

declare global {
    // make Locale type globally available
    type Locale = (typeof i18n)['locales'][number];
}

import {join} from 'node:path';
import {loadLocaleFile} from '../../core/locales.js';
import {loadSourceFile} from '../../core/source.js';
import type {Config} from '../../types.js';

interface MissingTranslation {
    key: string;
    locale: string;
    occurrences: Array<{file: string; line: number}>;
    text: string;
}

export interface CheckResult {
    complete: boolean;
    missing: MissingTranslation[];
}

export const checkCommand = async (
    config: Config,
    options: {app?: string; locale?: string; all?: boolean}
): Promise<CheckResult> => {
    const missing: MissingTranslation[] = [];

    // determine which apps to check
    if (options.app && !config.apps[options.app]) {
        throw new Error(
            `App "${options.app}" not found in config. Available: ${Object.keys(config.apps).join(', ')}`
        );
    }

    const appsToCheck =
        options.app && config.apps[options.app]
            ? {[options.app]: config.apps[options.app]}
            : config.apps;

    // determine which locales to check
    const localesToCheck = options.all
        ? config.locales
        : options.locale
          ? [options.locale]
          : [config.primaryLocale];

    // validate locale exists in config
    for (const locale of localesToCheck) {
        if (!config.locales.includes(locale)) {
            throw new Error(
                `Locale "${locale}" not found in config. Available: ${config.locales.join(', ')}`
            );
        }
    }

    // check each app
    for (const [appName, appConfig] of Object.entries(appsToCheck)) {
        if (!appConfig) continue;

        const sourcePath = join(appConfig.localesDir, 'source.json');
        const source = await loadSourceFile(sourcePath);

        // check each locale
        for (const locale of localesToCheck) {
            const localePath = join(appConfig.localesDir, `${locale}.json`);
            const localeFile = await loadLocaleFile(localePath);

            for (const [key, entry] of Object.entries(source.keys)) {
                // check if key exists and is not empty
                if (!localeFile[key] || localeFile[key].trim() === '') {
                    missing.push({
                        key,
                        locale: `${appName}:${locale}`,
                        occurrences: entry.occurrences,
                        text: entry.text
                    });
                }
            }
        }
    }

    return {
        complete: missing.length === 0,
        missing
    };
};

import { glob } from 'glob';
import { join, relative, resolve } from 'node:path';
import type { Config, ExtractedString } from '../../types.js';
import {
    loadLocaleFile,
    mergeLocaleFile,
    saveLocaleFile,
} from '../../core/locales.js';
import { parseFile } from '../../core/parser.js';
import {
    loadSourceFile,
    saveSourceFile,
    updateSourceFile,
} from '../../core/source.js';
import { saveTypes } from '../../core/types.js';

interface ExtractResult {
    addedKeys: string[];
    filesProcessed: number;
    stringsExtracted: number;
    warnings: Array<{ file: string; line: number; reason: string }>;
}

export const extractCommand = async (config: Config, appName?: string): Promise<ExtractResult> => {
    const cwd = process.cwd();
    const allWarnings: ExtractResult['warnings'] = [];
    let totalFiles = 0;
    let totalStrings = 0;
    let totalAddedKeys: string[] = [];

    // determine which apps to process
    if (appName && !config.apps[appName]) {
        throw new Error(`App "${appName}" not found in config. Available: ${Object.keys(config.apps).join(', ')}`);
    }

    const appsToProcess = appName
        ? { [appName]: config.apps[appName]! }
        : config.apps;

    // process each app separately
    for (const [name, appConfig] of Object.entries(appsToProcess)) {
        console.log(`\nProcessing app: ${name}`);
        
        const warnings: ExtractResult['warnings'] = [];
        let allExtracted: ExtractedString[] = [];

        // discover files
        const files: string[] = [];
        for (const scanPath of appConfig.scanPaths) {
            const pattern = join(scanPath, '**/*.{ts,tsx,js,jsx}');
            const found = await glob(pattern, {
                cwd,
                ignore: config.exclude,
            });
            files.push(...found.map((f) => resolve(cwd, f)));
        }

        // parse files and convert to relative paths
        for (const file of files) {
            const result = parseFile(file);
            // convert absolute paths to relative paths from project root
            const extractedWithRelativePaths = result.extracted.map((item) => ({
                ...item,
                file: relative(cwd, item.file),
            }));
            allExtracted.push(...extractedWithRelativePaths);
            
            const warningsWithRelativePaths = result.warnings.map((warning) => ({
                ...warning,
                file: relative(cwd, warning.file),
            }));
            warnings.push(...warningsWithRelativePaths);
        }

        // load existing source
        const sourcePath = join(appConfig.localesDir, 'source.json');
        const existingSource = loadSourceFile(sourcePath);

        // update source
        const updatedSource = updateSourceFile(allExtracted, existingSource);
        const addedKeys = Object.keys(updatedSource.keys).filter(
            (key) => !existingSource.keys[key],
        );

        // save source
        saveSourceFile(updatedSource, sourcePath);

        // generate types
        saveTypes(updatedSource, appConfig.typesOutput);

        // merge locale files
        for (const locale of config.locales) {
            const localePath = join(appConfig.localesDir, `${locale}.json`);
            const existingLocale = loadLocaleFile(localePath);
            const merged = mergeLocaleFile(
                updatedSource,
                existingLocale,
                locale,
                config.primaryLocale,
            );
            saveLocaleFile(merged, localePath);
        }

        console.log(`  ✓ Parsed ${files.length} files`);
        console.log(`  ✓ Extracted ${allExtracted.length} strings (${addedKeys.length} new)`);
        console.log(`  ✓ Updated ${appConfig.localesDir}/source.json`);
        console.log(`  ✓ Generated ${appConfig.typesOutput}`);
        console.log(`  ✓ Merged into ${config.locales.length} locale files`);

        if (warnings.length > 0) {
            console.log(`  ⚠ ${warnings.length} warnings`);
        }

        totalFiles += files.length;
        totalStrings += allExtracted.length;
        totalAddedKeys.push(...addedKeys);
        allWarnings.push(...warnings);
    }

    return {
        addedKeys: totalAddedKeys,
        filesProcessed: totalFiles,
        stringsExtracted: totalStrings,
        warnings: allWarnings,
    };
};


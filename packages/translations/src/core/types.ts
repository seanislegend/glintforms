/// <reference types="bun-types" />

import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import type {SourceEntry, SourceFile} from '../types.js';

export const generateTypes = (source: SourceFile): string => {
    let output = '/**\n';
    output += ' * Auto-generated translation keys\n';
    output += ' * Do not edit manually - run `bun translation extract` to regenerate\n';
    output += ` * Generated: ${source.generated}\n`;
    output += ' */\n\n';

    output += 'export interface TranslationKeys {\n';

    const sortedKeys = Object.keys(source.keys).sort();

    for (const key of sortedKeys) {
        const entry = source.keys[key];

        if (!entry) continue;

        // escape quotes in text
        const escapedText = entry.text.replace(/"/g, '\\"');

        output += '    /**\n';
        output += `     * **Text:** "${escapedText}"\n`;
        output += '     *\n';

        for (const occ of entry.occurrences) {
            output += `     * @see ${occ.file}:${occ.line}\n`;
        }

        output += '     */\n';
        output += `    "${key}": string;\n\n`;
    }

    output += '}\n\n';
    output += 'export type TranslationKey = keyof TranslationKeys;\n\n';

    // add utility type to extract all text values
    output += '/**\n';
    output += ' * Union type of all translation text values for use in t() function\n';
    output += ' * Only original text strings appear in autocomplete, not internal key names\n';
    output += ' */\n';
    output += 'export type TranslationText =\n';

    const texts = sortedKeys
        .map(key => source.keys[key])
        .filter((entry): entry is SourceEntry => entry !== undefined)
        .map(entry => entry.text.replace(/"/g, '\\"').replace(/\n/g, '\\n'));

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        const isLast = i === texts.length - 1;
        output += `    | "${text}"${isLast ? ';\n' : '\n'}`;
    }

    return output;
};

export const saveTypes = async (source: SourceFile, path: string): Promise<void> => {
    const resolvedPath = resolve(process.cwd(), path);

    // ensure directory exists
    const dir = dirname(resolvedPath);
    await mkdir(dir, {recursive: true});

    const types = generateTypes(source);
    await Bun.write(resolvedPath, types);
};

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SourceFile } from "../types.js";

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
        output += `     * "${escapedText}"\n`;

        for (const occ of entry.occurrences) {
            output += `     * @see ${occ.file}:${occ.line}\n`;
        }

        output += '     */\n';
        output += `    "${key}": string;\n\n`;
    }

    output += '}\n\n';
    output += 'export type TranslationKey = keyof TranslationKeys;\n';

    return output;
};

export const saveTypes = (source: SourceFile, path: string): void => {
    const resolvedPath = resolve(process.cwd(), path);

    // ensure directory exists
    const dir = dirname(resolvedPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    const types = generateTypes(source);
    writeFileSync(resolvedPath, types, 'utf-8');
};


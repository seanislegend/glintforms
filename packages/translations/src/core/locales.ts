/// <reference types="bun-types" />

import {mkdir} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import type {LocaleFile, SourceFile} from '../types.js';

export const loadLocaleFile = async (path: string): Promise<LocaleFile> => {
    const resolvedPath = resolve(process.cwd(), path);
    const file = Bun.file(resolvedPath);

    if (!(await file.exists())) {
        return {};
    }

    try {
        const content = await file.text();
        return JSON.parse(content);
    } catch (error) {
        throw new Error(
            `Failed to load locale file from ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`
        );
    }
};

export const mergeLocaleFile = (
    source: SourceFile,
    existing: LocaleFile,
    locale: string,
    primaryLocale: string
): LocaleFile => {
    const merged: LocaleFile = {...existing};

    // add missing keys from source
    for (const [key, entry] of Object.entries(source.keys)) {
        if (!(key in merged) && entry) {
            // for primary locale, populate from extracted text
            // for other locales, add empty string
            merged[key] = locale === primaryLocale ? entry.text : '';
        }
    }

    // sort keys alphabetically for clean diffs
    const sorted: LocaleFile = {};
    for (const key of Object.keys(merged).sort()) {
        const value = merged[key];
        if (value !== undefined) {
            sorted[key] = value;
        }
    }

    return sorted;
};

export const saveLocaleFile = async (locale: LocaleFile, path: string): Promise<void> => {
    const resolvedPath = resolve(process.cwd(), path);

    // ensure directory exists
    const dir = dirname(resolvedPath);
    await mkdir(dir, {recursive: true});

    // write atomically
    const tempPath = `${resolvedPath}.tmp`;
    const content = JSON.stringify(locale, null, 4);
    await Bun.write(tempPath, content);

    // verify valid JSON
    try {
        const tempFile = Bun.file(tempPath);
        const tempContent = await tempFile.text();
        JSON.parse(tempContent);
    } catch (error) {
        throw new Error(
            `Generated invalid JSON: ${error instanceof Error ? error.message : String(error)}`
        );
    }

    // rename atomically
    const tempFile = Bun.file(tempPath);
    const finalContent = await tempFile.text();
    await Bun.write(resolvedPath, finalContent);
};

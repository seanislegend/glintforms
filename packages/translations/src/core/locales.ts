import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { LocaleFile, SourceFile } from "../types.js";

export const loadLocaleFile = (path: string): LocaleFile => {
    const resolvedPath = resolve(process.cwd(), path);

    if (!existsSync(resolvedPath)) {
        return {};
    }

    try {
        const content = readFileSync(resolvedPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(
            `Failed to load locale file from ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
};

export const mergeLocaleFile = (
    source: SourceFile,
    existing: LocaleFile,
    locale: string,
    primaryLocale: string,
): LocaleFile => {
    const merged: LocaleFile = { ...existing };

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

export const saveLocaleFile = (locale: LocaleFile, path: string): void => {
    const resolvedPath = resolve(process.cwd(), path);

    // ensure directory exists
    const dir = dirname(resolvedPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    // write atomically
    const tempPath = `${resolvedPath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(locale, null, 4), 'utf-8');

    // verify valid JSON
    try {
        JSON.parse(readFileSync(tempPath, 'utf-8'));
    } catch (error) {
        throw new Error(
            `Generated invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
        );
    }

    // rename atomically
    writeFileSync(resolvedPath, readFileSync(tempPath, 'utf-8'));
};


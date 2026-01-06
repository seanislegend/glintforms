import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ExtractedString, Occurrence, SourceEntry, SourceFile } from "../types.js";
import { generateKey, hashText } from "./keys.js";

export const loadSourceFile = (path: string): SourceFile => {
    const resolvedPath = resolve(process.cwd(), path);

    if (!existsSync(resolvedPath)) {
        return {
            generated: new Date().toISOString(),
            keys: {},
            version: '1.0.0',
        };
    }

    try {
        const content = readFileSync(resolvedPath, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        throw new Error(
            `Failed to load source file from ${resolvedPath}: ${error instanceof Error ? error.message : String(error)}`,
        );
    }
};

export const updateSourceFile = (
    extracted: ExtractedString[],
    existing: SourceFile,
): SourceFile => {
    const updated: SourceFile = {
        ...existing,
        generated: new Date().toISOString(),
    };

    // group extractions by text content
    const textGroups = new Map<string, ExtractedString[]>();
    for (const item of extracted) {
        const items = textGroups.get(item.text) || [];
        items.push(item);
        textGroups.set(item.text, items);
    }

    // process each unique text
    for (const [text, items] of textGroups) {
        const hash = hashText(text);
        const firstItem = items[0];
        
        if (!firstItem) continue;

        // find existing key for this text
        const existingKey = Object.entries(existing.keys).find(
            ([, entry]) => entry.hash === hash,
        );

        if (existingKey) {
            const [key, entry] = existingKey;

            // verify no hash collision
            if (entry.text !== text) {
                throw new Error(
                    `Hash collision detected!\n` +
                        `Hash: ${hash.slice(0, 7)}\n` +
                        `Existing text: "${entry.text}"\n` +
                        `New text: "${text}"\n` +
                        `This should be extremely rare. Please report this issue.`,
                );
            }

            // merge occurrences
            const existingOccurrences = new Set(
                entry.occurrences.map((o) => `${o.file}:${o.line}`),
            );
            const newOccurrences: Occurrence[] = items
                .filter(
                    (item) =>
                        !existingOccurrences.has(`${item.file}:${item.line}`),
                )
                .map((item) => ({
                    file: item.file,
                    line: item.line,
                }));

            if (entry) {
                updated.keys[key] = {
                    ...entry,
                    occurrences: [...entry.occurrences, ...newOccurrences].sort(
                        (a, b) => {
                            if (a.file !== b.file) return a.file.localeCompare(b.file);
                            return a.line - b.line;
                        },
                    ),
                };
            }
        } else {
            // create new entry
            // check if text appears in multiple distinct files
            const uniqueFiles = new Set(items.map(item => item.file));
            const isCommon = uniqueFiles.size > 1;
            
            const key = isCommon 
                ? generateKey(text, 'common')
                : generateKey(text, firstItem.file);

            // check if key already exists (shouldn't happen, but defensive)
            if (updated.keys[key]) {
                throw new Error(
                    `Key collision: ${key} already exists with different text`,
                );
            }

            updated.keys[key] = {
                added: new Date().toISOString(),
                hash,
                occurrences: items
                    .map((item) => ({
                        file: item.file,
                        line: item.line,
                    }))
                    .sort((a, b) => {
                        if (a.file !== b.file) return a.file.localeCompare(b.file);
                        return a.line - b.line;
                    }),
                text,
            };
        }
    }

    return updated;
};

export const saveSourceFile = (source: SourceFile, path: string): void => {
    const resolvedPath = resolve(process.cwd(), path);

    // ensure directory exists
    const dir = dirname(resolvedPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    // sort keys alphabetically for clean diffs
    const sorted: SourceFile = {
        ...source,
        keys: Object.keys(source.keys)
            .sort()
            .reduce(
                (acc, key) => {
                    const entry = source.keys[key];
                    if (entry) {
                        acc[key] = entry;
                    }
                    return acc;
                },
                {} as Record<string, SourceEntry>,
            ),
    };

    // write atomically
    const tempPath = `${resolvedPath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(sorted, null, 2), 'utf-8');

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


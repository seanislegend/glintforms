import { describe, it, expect } from "vitest";
import { generateTypes } from "../src/core/types";
import type { SourceFile } from "../src/types";

describe("type generator", () => {
    it("generates TypeScript interface with JSDoc", () => {
        const source: SourceFile = {
            generated: "2026-01-06T12:00:00Z",
            keys: {
                "admin.surveys.save.abc1234": {
                    added: "2026-01-06T12:00:00Z",
                    hash: "abc1234567890",
                    occurrences: [
                        {
                            file: "apps/admin/src/surveys/page.tsx",
                            line: 42,
                        },
                    ],
                    text: "Save changes",
                },
            },
            version: "1.0.0",
        };

        const result = generateTypes(source);

        expect(result).toContain("export interface TranslationKeys");
        expect(result).toContain("export type TranslationKey");
        expect(result).toContain('"admin.surveys.save.abc1234": string;');
        expect(result).toContain("Save changes");
        expect(result).toContain("@see apps/admin/src/surveys/page.tsx:42");
    });

    it("escapes quotes in text", () => {
        const source: SourceFile = {
            generated: "2026-01-06T12:00:00Z",
            keys: {
                "admin.test.abc1234": {
                    added: "2026-01-06T12:00:00Z",
                    hash: "abc1234567890",
                    occurrences: [{ file: "test.tsx", line: 1 }],
                    text: 'She said "hello"',
                },
            },
            version: "1.0.0",
        };

        const result = generateTypes(source);

        expect(result).toContain('She said \\"hello\\"');
    });

    it("includes multiple occurrences", () => {
        const source: SourceFile = {
            generated: "2026-01-06T12:00:00Z",
            keys: {
                "admin.common.save.abc1234": {
                    added: "2026-01-06T12:00:00Z",
                    hash: "abc1234567890",
                    occurrences: [
                        { file: "apps/admin/src/surveys/page.tsx", line: 42 },
                        { file: "apps/admin/src/campaigns/page.tsx", line: 67 },
                    ],
                    text: "Save",
                },
            },
            version: "1.0.0",
        };

        const result = generateTypes(source);

        expect(result).toContain("@see apps/admin/src/surveys/page.tsx:42");
        expect(result).toContain("@see apps/admin/src/campaigns/page.tsx:67");
    });

    it("sorts keys alphabetically", () => {
        const source: SourceFile = {
            generated: "2026-01-06T12:00:00Z",
            keys: {
                "zzz.test.abc1234": {
                    added: "2026-01-06T12:00:00Z",
                    hash: "abc",
                    occurrences: [{ file: "test.tsx", line: 1 }],
                    text: "Z",
                },
                "aaa.test.def5678": {
                    added: "2026-01-06T12:00:00Z",
                    hash: "def",
                    occurrences: [{ file: "test.tsx", line: 2 }],
                    text: "A",
                },
            },
            version: "1.0.0",
        };

        const result = generateTypes(source);

        const aIndex = result.indexOf('"aaa.test.def5678"');
        const zIndex = result.indexOf('"zzz.test.abc1234"');

        expect(aIndex).toBeLessThan(zIndex);
    });
});


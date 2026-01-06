import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { parseFile } from "../src/core/parser";

const TEST_DIR = join(process.cwd(), "tests", "__fixtures__");

beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("parser", () => {
    it("extracts string literals", () => {
        const file = join(TEST_DIR, "test1.tsx");
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            export default function Test() {
                return <div>{t('Hello world')}</div>;
            }
        `,
        );

        const result = parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe("Hello world");
        expect(result.warnings).toHaveLength(0);
    });

    it("extracts double quoted strings", () => {
        const file = join(TEST_DIR, "test2.tsx");
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const text = t("Save changes");
        `,
        );

        const result = parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe("Save changes");
    });

    it("extracts template literals without expressions", () => {
        const file = join(TEST_DIR, "test3.tsx");
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const text = t(\`Delete item\`);
        `,
        );

        const result = parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe("Delete item");
    });

    it("warns on template literals with expressions", () => {
        const file = join(TEST_DIR, "test4.tsx");
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const name = 'John';
            const text = t(\`Hello \${name}\`);
        `,
        );

        const result = parseFile(file);
        expect(result.extracted).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].reason).toContain("expressions");
    });

    it("warns on dynamic calls", () => {
        const file = join(TEST_DIR, "test5.tsx");
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const key = 'some.key';
            const text = t(key);
        `,
        );

        const result = parseFile(file);
        expect(result.extracted).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
    });

    it("extracts multiple t() calls", () => {
        const file = join(TEST_DIR, "test6.tsx");
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            export default function Test() {
                return (
                    <div>
                        <button>{t('Save')}</button>
                        <button>{t('Cancel')}</button>
                        <span>{t('Loading...')}</span>
                    </div>
                );
            }
        `,
        );

        const result = parseFile(file);
        expect(result.extracted).toHaveLength(3);
        expect(result.extracted.map((e) => e.text)).toEqual([
            "Save",
            "Cancel",
            "Loading...",
        ]);
    });
});


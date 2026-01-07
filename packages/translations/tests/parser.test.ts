import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import {mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {parseFile} from '../src/core/parser';

const TEST_DIR = join(process.cwd(), 'tests', '__fixtures__');

beforeEach(() => {
    mkdirSync(TEST_DIR, {recursive: true});
});

afterEach(() => {
    rmSync(TEST_DIR, {recursive: true, force: true});
});

describe('parser', () => {
    test('extracts string literals', async () => {
        const file = join(TEST_DIR, 'test1.tsx');
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            export default function Test() {
                return <div>{t('Hello world')}</div>;
            }
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe('Hello world');
        expect(result.warnings).toHaveLength(0);
    });

    test('extracts double quoted strings', async () => {
        const file = join(TEST_DIR, 'test2.tsx');
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const text = t("Save changes");
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe('Save changes');
    });

    test('extracts template literals without expressions', async () => {
        const file = join(TEST_DIR, 'test3.tsx');
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const text = t(\`Delete item\`);
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe('Delete item');
    });

    test('warns on template literals with expressions', async () => {
        const file = join(TEST_DIR, 'test4.tsx');
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const name = 'John';
            const text = t(\`Hello \${name}\`);
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].reason).toContain('expressions');
    });

    test('warns on dynamic calls', async () => {
        const file = join(TEST_DIR, 'test5.tsx');
        writeFileSync(
            file,
            `
            import { t } from './i18n';
            const key = 'some.key';
            const text = t(key);
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(0);
        expect(result.warnings).toHaveLength(1);
    });

    test('extracts multiple t() calls', async () => {
        const file = join(TEST_DIR, 'test6.tsx');
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
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(3);
        expect(result.extracted.map(e => e.text)).toEqual(['Save', 'Cancel', 'Loading...']);
    });

    test('extracts string with /*i18n*/ comment', async () => {
        const file = join(TEST_DIR, 'test7.tsx');
        writeFileSync(
            file,
            `
            export const FIELDS = [
                /*i18n*/ 'Name',
                /*i18n*/ 'Email'
            ];
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(2);
        expect(result.extracted[0].text).toBe('Name');
        expect(result.extracted[1].text).toBe('Email');
    });

    test('extracts comment from line before /*i18n*/', async () => {
        const file = join(TEST_DIR, 'test8.tsx');
        writeFileSync(
            file,
            `
            export const FIELDS = [
                // This is the name field
                /*i18n*/ 'Name',
                // This is the email field
                /*i18n*/ 'Email'
            ];
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(2);
        expect(result.extracted[0].text).toBe('Name');
        expect(result.extracted[0].comment).toBe('This is the name field');
        expect(result.extracted[1].text).toBe('Email');
        expect(result.extracted[1].comment).toBe('This is the email field');
    });

    test('extracts block comment from line before /*i18n*/', async () => {
        const file = join(TEST_DIR, 'test9.tsx');
        writeFileSync(
            file,
            `
            export const FIELDS = [
                /* This is a block comment */
                /*i18n*/ 'Name'
            ];
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe('Name');
        expect(result.extracted[0].comment).toBe('This is a block comment');
    });

    test('does not extract string without /*i18n*/ comment', async () => {
        const file = join(TEST_DIR, 'test10.tsx');
        writeFileSync(
            file,
            `
            export const FIELDS = [
                'Name',
                'Email'
            ];
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(0);
    });

    test('comment is undefined when no preceding comment', async () => {
        const file = join(TEST_DIR, 'test11.tsx');
        writeFileSync(
            file,
            `
            export const FIELDS = [
                /*i18n*/ 'Name'
            ];
        `
        );

        const result = await parseFile(file);
        expect(result.extracted).toHaveLength(1);
        expect(result.extracted[0].text).toBe('Name');
        expect(result.extracted[0].comment).toBeUndefined();
    });
});

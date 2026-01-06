import {describe, expect, test} from 'bun:test';
import {mergeLocaleFile} from '../src/core/locales';
import type {LocaleFile, SourceFile} from '../src/types';

describe('locale merger', () => {
    test('adds missing keys for primary locale', () => {
        const source: SourceFile = {
            generated: '2026-01-06T12:00:00Z',
            keys: {
                'admin.test.abc1234': {
                    added: '2026-01-06T12:00:00Z',
                    hash: 'abc1234567890',
                    occurrences: [{file: 'test.tsx', line: 1}],
                    text: 'Hello world'
                }
            },
            version: '1.0.0'
        };

        const existing: LocaleFile = {};

        const result = mergeLocaleFile(source, existing, 'en', 'en');

        expect(result['admin.test.abc1234']).toBe('Hello world');
    });

    test('adds empty strings for non-primary locale', () => {
        const source: SourceFile = {
            generated: '2026-01-06T12:00:00Z',
            keys: {
                'admin.test.abc1234': {
                    added: '2026-01-06T12:00:00Z',
                    hash: 'abc1234567890',
                    occurrences: [{file: 'test.tsx', line: 1}],
                    text: 'Hello world'
                }
            },
            version: '1.0.0'
        };

        const existing: LocaleFile = {};

        const result = mergeLocaleFile(source, existing, 'fr', 'en');

        expect(result['admin.test.abc1234']).toBe('');
    });

    test('preserves existing translations', () => {
        const source: SourceFile = {
            generated: '2026-01-06T12:00:00Z',
            keys: {
                'admin.test.abc1234': {
                    added: '2026-01-06T12:00:00Z',
                    hash: 'abc1234567890',
                    occurrences: [{file: 'test.tsx', line: 1}],
                    text: 'Hello world'
                }
            },
            version: '1.0.0'
        };

        const existing: LocaleFile = {
            'admin.test.abc1234': 'Bonjour le monde'
        };

        const result = mergeLocaleFile(source, existing, 'fr', 'en');

        expect(result['admin.test.abc1234']).toBe('Bonjour le monde');
    });

    test('sorts keys alphabetically', () => {
        const source: SourceFile = {
            generated: '2026-01-06T12:00:00Z',
            keys: {
                'zzz.test': {
                    added: '2026-01-06T12:00:00Z',
                    hash: 'abc',
                    occurrences: [{file: 'test.tsx', line: 1}],
                    text: 'Z'
                },
                'aaa.test': {
                    added: '2026-01-06T12:00:00Z',
                    hash: 'def',
                    occurrences: [{file: 'test.tsx', line: 2}],
                    text: 'A'
                }
            },
            version: '1.0.0'
        };

        const existing: LocaleFile = {};

        const result = mergeLocaleFile(source, existing, 'en', 'en');

        const keys = Object.keys(result);
        expect(keys).toEqual(['aaa.test', 'zzz.test']);
    });
});

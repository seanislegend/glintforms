import {describe, expect, it} from 'vitest';
import {transformNullToUndefined} from '@/utils/database';

describe('transformNullToUndefined', () => {
    it('transforms null values to undefined', () => {
        const input = {
            name: 'John',
            age: null,
            email: 'john@example.com',
            phone: null
        };

        const result = transformNullToUndefined(input);

        expect(result).toEqual({
            name: 'John',
            age: undefined,
            email: 'john@example.com',
            phone: undefined
        });
    });

    it('preserves non-null values', () => {
        const input = {
            string: 'test',
            number: 123,
            boolean: true,
            object: {key: 'value'},
            array: [1, 2, 3]
        };

        const result = transformNullToUndefined(input);

        expect(result).toEqual(input);
    });

    it('handles empty object', () => {
        const input = {};
        const result = transformNullToUndefined(input);

        expect(result).toEqual({});
    });

    it('handles object with only null values', () => {
        const input = {
            field1: null,
            field2: null
        };

        const result = transformNullToUndefined(input);

        expect(result).toEqual({
            field1: undefined,
            field2: undefined
        });
    });

    it('handles mixed null and non-null values', () => {
        const input = {
            name: null,
            age: 25,
            email: null,
            active: true
        };

        const result = transformNullToUndefined(input);

        expect(result).toEqual({
            name: undefined,
            age: 25,
            email: undefined,
            active: true
        });
    });
});

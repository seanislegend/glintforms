import {describe, expect, it} from 'vitest';
import {mapObjectValuesToNumber} from '@/utils/map-object-values-to-number';

describe('mapObjectValuesToNumber', () => {
    it('converts string numbers to numbers when no keys specified', () => {
        const input = {age: '25', score: '100', count: '0'};
        const result = mapObjectValuesToNumber(input);

        expect(result).toEqual({age: 25, score: 100, count: 0});
    });

    it('converts only specified keys to numbers', () => {
        const input = {age: '25', name: 'John', score: '100', email: 'john@example.com'};
        const result = mapObjectValuesToNumber(input, ['age', 'score']);

        expect(result).toEqual({age: 25, name: 'John', score: 100, email: 'john@example.com'});
    });

    it('preserves existing numbers', () => {
        const input = {age: 25, score: 100, count: 0};
        const result = mapObjectValuesToNumber(input);

        expect(result).toEqual(input);
    });

    it('preserves null values', () => {
        const input = {age: '25', score: null, count: '0'};
        const result = mapObjectValuesToNumber(input);

        expect(result).toEqual({age: 25, score: null, count: 0});
    });

    it('handles empty object', () => {
        const input = {};
        const result = mapObjectValuesToNumber(input);

        expect(result).toEqual({});
    });

    it('handles empty keys array', () => {
        const input = {age: '25', name: 'John'};
        const result = mapObjectValuesToNumber(input, []);

        expect(result).toEqual({age: 25, name: NaN});
    });

    it('handles non-numeric strings', () => {
        const input = {age: 'not-a-number', score: '100', name: 'John'};
        const result = mapObjectValuesToNumber(input);

        expect(result).toEqual({age: NaN, score: 100, name: NaN});
    });

    it('handles decimal strings', () => {
        const input = {price: '19.99', quantity: '5'};
        const result = mapObjectValuesToNumber(input);

        expect(result).toEqual({price: 19, quantity: 5});
    });
});

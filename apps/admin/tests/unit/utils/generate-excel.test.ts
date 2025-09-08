import {describe, expect, it} from 'vitest';
import {generateExcel} from '@/utils/generate-excel';

describe('generateExcel', () => {
    it('generates excel buffer from data', async () => {
        const data = [
            {name: 'John', age: 25, city: 'London'},
            {name: 'Jane', age: 30, city: 'Manchester'}
        ];

        const result = await generateExcel(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('handles empty data array', async () => {
        const data: Record<string, unknown>[] = [];

        const result = await generateExcel(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('handles data with various types', async () => {
        const data = [
            {string: 'text', number: 123, boolean: true, null: null},
            {string: 'another', number: 456, boolean: false, null: undefined}
        ];

        const result = await generateExcel(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('handles data with nested objects', async () => {
        const data = [
            {name: 'John', metadata: {role: 'admin', active: true}},
            {name: 'Jane', metadata: {role: 'user', active: false}}
        ];

        const result = await generateExcel(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });
});

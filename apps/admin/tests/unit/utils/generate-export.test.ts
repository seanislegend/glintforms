import {describe, expect, it} from 'vitest';
import {generateCSV} from '@/utils/generate-export';

describe('generateCSV (from generate-export)', () => {
    it('generates csv with simple data', () => {
        const data = [
            {name: 'John', age: 25, city: 'London'},
            {name: 'Jane', age: 30, city: 'Manchester'}
        ];
        const fields = ['name', 'age', 'city'];

        const result = generateCSV(data, fields);

        expect(result).toBe('"name","age","city"\n"John","25","London"\n"Jane","30","Manchester"');
    });

    it('handles null and undefined values', () => {
        const data = [
            {name: 'John', age: null, city: undefined},
            {name: 'Jane', age: 30, city: 'Manchester'}
        ];
        const fields = ['name', 'age', 'city'];

        const result = generateCSV(data, fields);

        expect(result).toBe('"name","age","city"\n"John","",""\n"Jane","30","Manchester"');
    });

    it('escapes quotes in values', () => {
        const data = [
            {name: 'John "Johnny" Smith', age: 25},
            {name: "Jane's Cafe", age: 30}
        ];
        const fields = ['name', 'age'];

        const result = generateCSV(data, fields);

        expect(result).toBe('"name","age"\n"John ""Johnny"" Smith","25"\n"Jane\'s Cafe","30"');
    });

    it('handles object values', () => {
        const data = [
            {name: 'John', metadata: {role: 'admin', active: true}},
            {name: 'Jane', metadata: {role: 'user', active: false}}
        ];
        const fields = ['name', 'metadata'];

        const result = generateCSV(data, fields);

        expect(result).toBe(
            '"name","metadata"\n"John","{""role"":""admin"",""active"":true}"\n"Jane","{""role"":""user"",""active"":false}"'
        );
    });

    it('handles empty data array', () => {
        const data: Record<string, unknown>[] = [];
        const fields = ['name', 'age'];

        const result = generateCSV(data, fields);

        expect(result).toBe('"name","age"');
    });

    it('handles empty fields array', () => {
        const data = [{name: 'John', age: 25}];
        const fields: string[] = [];

        const result = generateCSV(data, fields);

        expect(result).toBe('\n');
    });
});

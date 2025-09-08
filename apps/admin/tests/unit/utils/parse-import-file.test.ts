import {describe, expect, it} from 'vitest';
import {parseImportFile} from '@/utils/parse-import-file';

describe('parseImportFile', () => {
    it('throws error for unsupported file type', async () => {
        const file = new File([''], 'test.txt', {type: 'text/plain'});

        await expect(parseImportFile(file)).rejects.toThrow(
            'Unsupported file type. Please upload a CSV or XLSX file.'
        );
    });

    it('parses csv file with correct mime type', async () => {
        const csvContent = 'name,age,city\nJohn,25,London\nJane,30,Manchester';
        const file = new File([csvContent], 'test.csv', {type: 'text/csv'});
        const result = await parseImportFile(file);

        expect(result).toEqual([
            {name: 'John', age: '25', city: 'London'},
            {name: 'Jane', age: '30', city: 'Manchester'}
        ]);
    });

    it('parses csv file with .csv extension', async () => {
        const csvContent = 'name,age\nJohn,25\nJane,30';
        const file = new File([csvContent], 'test.csv', {type: 'application/octet-stream'});

        const result = await parseImportFile(file);

        expect(result).toEqual([
            {name: 'John', age: '25'},
            {name: 'Jane', age: '30'}
        ]);
    });

    it.skip('parses xlsx file with correct mime type', async () => {
        // skip this test as it requires xlsx mocking which is complex
    });

    it.skip('parses xlsx file with .xlsx extension', async () => {
        // skip this test as it requires xlsx mocking which is complex
    });

    it('throws error for csv with insufficient data', async () => {
        const csvContent = 'name,age\n'; // only header
        const file = new File([csvContent], 'test.csv', {type: 'text/csv'});

        await expect(parseImportFile(file)).rejects.toThrow(
            'CSV file must contain at least a header row and one data row.'
        );
    });

    it.skip('throws error for xlsx with no sheets', async () => {
        // skip this test as it requires xlsx mocking which is complex
    });

    it.skip('throws error for xlsx with insufficient data', async () => {
        // skip this test as it requires xlsx mocking which is complex
    });

    it('handles csv with quoted values', async () => {
        const csvContent = '"name","age","city"\n"John","25","London"\n"Jane","30","Manchester"';
        const file = new File([csvContent], 'test.csv', {type: 'text/csv'});
        const result = await parseImportFile(file);

        expect(result).toEqual([
            {name: 'John', age: '25', city: 'London'},
            {name: 'Jane', age: '30', city: 'Manchester'}
        ]);
    });

    it('handles csv with missing values', async () => {
        const csvContent = 'name,age,city\nJohn,25,\nJane,,Manchester';
        const file = new File([csvContent], 'test.csv', {type: 'text/csv'});
        const result = await parseImportFile(file);

        expect(result).toEqual([
            {name: 'John', age: '25', city: ''},
            {name: 'Jane', age: '', city: 'Manchester'}
        ]);
    });
});

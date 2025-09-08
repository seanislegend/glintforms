import {describe, expect, it} from 'vitest';
import {generateXLSForm} from '@/utils/generate-xlsform';

describe('generateXLSForm', () => {
    it('generates xlsform with all sheets', async () => {
        const data = {
            survey: [
                {type: 'text', name: 'question1', label: 'What is your name?'},
                {type: 'select_one', name: 'question2', label: 'Choose an option'}
            ],
            choices: [
                {list_name: 'options', name: 'option1', label: 'Option 1'},
                {list_name: 'options', name: 'option2', label: 'Option 2'}
            ],
            settings: [
                {key: 'title', value: 'My Survey'},
                {key: 'version', value: '1.0'}
            ]
        };

        const result = await generateXLSForm(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('generates xlsform with only survey sheet', async () => {
        const data = {
            survey: [{type: 'text', name: 'question1', label: 'What is your name?'}],
            choices: [],
            settings: []
        };

        const result = await generateXLSForm(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('generates xlsform with only choices sheet', async () => {
        const data = {
            survey: [],
            choices: [{list_name: 'options', name: 'option1', label: 'Option 1'}],
            settings: []
        };

        const result = await generateXLSForm(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('generates xlsform with only settings sheet', async () => {
        const data = {
            survey: [],
            choices: [],
            settings: [{key: 'title', value: 'My Survey'}]
        };

        const result = await generateXLSForm(data);

        expect(result).toBeInstanceOf(Buffer);
        expect(result.length).toBeGreaterThan(0);
    });

    it('generates xlsform with empty data', async () => {
        const data = {
            survey: [],
            choices: [],
            settings: []
        };

        await expect(generateXLSForm(data)).rejects.toThrow('Workbook is empty');
    });
});

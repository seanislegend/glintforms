import {describe, expect, it} from 'vitest';
import {humanise} from '@/utils/humanise';

describe('humanise', () => {
    it('converts snake_case to title case', () => {
        expect(humanise('user_name')).toBe('User name');
        expect(humanise('first_name')).toBe('First name');
        expect(humanise('last_name')).toBe('Last name');
    });

    it('handles single word', () => {
        expect(humanise('name')).toBe('Name');
        expect(humanise('user')).toBe('User');
    });

    it('handles multiple underscores', () => {
        expect(humanise('user_first_name')).toBe('User first name');
        expect(humanise('api_key_value')).toBe('Api key value');
    });

    it('handles empty string', () => {
        expect(humanise('')).toBe('');
    });

    it('handles null and undefined', () => {
        expect(humanise(null)).toBe('');
        expect(humanise(undefined)).toBe('');
    });

    it('handles strings without underscores', () => {
        expect(humanise('name')).toBe('Name');
        expect(humanise('UserName')).toBe('Username');
    });

    it('handles strings with leading/trailing underscores', () => {
        expect(humanise('_name_')).toBe(' name ');
        expect(humanise('__user__')).toBe('  user  ');
    });

    it('handles mixed case with underscores', () => {
        expect(humanise('User_Name')).toBe('User name');
        expect(humanise('API_KEY')).toBe('Api key');
    });
});

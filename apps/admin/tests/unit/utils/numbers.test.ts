import {describe, expect, it} from 'vitest';
import {formatNumber} from '@/utils/numbers';

describe('formatNumber', () => {
    it('formats positive integers', () => {
        expect(formatNumber(1234)).toBe('1,234');
        expect(formatNumber(1000000)).toBe('1,000,000');
        expect(formatNumber(0)).toBe('');
    });

    it('formats decimal numbers', () => {
        expect(formatNumber(1234.56)).toBe('1,234.56');
        expect(formatNumber(1000000.123)).toBe('1,000,000.123');
    });

    it('returns empty string for falsy values', () => {
        expect(formatNumber(0)).toBe('');
        expect(formatNumber(null as any)).toBe('');
        expect(formatNumber(undefined as any)).toBe('');
        expect(formatNumber(false as any)).toBe('');
    });

    it('formats negative numbers', () => {
        expect(formatNumber(-1234)).toBe('-1,234');
        expect(formatNumber(-1000000)).toBe('-1,000,000');
    });

    it('formats small numbers', () => {
        expect(formatNumber(1)).toBe('1');
        expect(formatNumber(10)).toBe('10');
        expect(formatNumber(100)).toBe('100');
    });
});

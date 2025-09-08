import {describe, expect, it} from 'vitest';
import {formatDay} from '@/utils/format-day';

describe('formatDay', () => {
    it('formats valid day numbers', () => {
        expect(formatDay(0)).toBe('Sunday');
        expect(formatDay(1)).toBe('Monday');
        expect(formatDay(2)).toBe('Tuesday');
        expect(formatDay(3)).toBe('Wednesday');
        expect(formatDay(4)).toBe('Thursday');
        expect(formatDay(5)).toBe('Friday');
        expect(formatDay(6)).toBe('Saturday');
    });

    it('returns unknown for invalid day numbers', () => {
        expect(formatDay(7)).toBe('Unknown');
        expect(formatDay(10)).toBe('Unknown');
        expect(formatDay(-1)).toBe('Unknown');
    });

    it('returns empty string for non-number inputs', () => {
        expect(formatDay('0' as any)).toBe('');
        expect(formatDay(null as any)).toBe('');
        expect(formatDay(undefined as any)).toBe('');
        expect(formatDay({} as any)).toBe('');
        expect(formatDay([] as any)).toBe('');
    });
});

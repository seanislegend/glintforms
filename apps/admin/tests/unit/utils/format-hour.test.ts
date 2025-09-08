import {describe, expect, it} from 'vitest';
import {formatHour} from '@/utils/format-hour';

describe('formatHour', () => {
    it('formats midnight correctly', () => {
        expect(formatHour(0)).toBe('12am');
    });

    it('formats morning hours correctly', () => {
        expect(formatHour(1)).toBe('1am');
        expect(formatHour(6)).toBe('6am');
        expect(formatHour(11)).toBe('11am');
    });

    it('formats noon correctly', () => {
        expect(formatHour(12)).toBe('12pm');
    });

    it('formats afternoon and evening hours correctly', () => {
        expect(formatHour(13)).toBe('1pm');
        expect(formatHour(15)).toBe('3pm');
        expect(formatHour(18)).toBe('6pm');
        expect(formatHour(23)).toBe('11pm');
    });

    it('returns empty string for non-number inputs', () => {
        expect(formatHour('12' as any)).toBe('');
        expect(formatHour(null as any)).toBe('');
        expect(formatHour(undefined as any)).toBe('');
        expect(formatHour({} as any)).toBe('');
        expect(formatHour([] as any)).toBe('');
    });
});

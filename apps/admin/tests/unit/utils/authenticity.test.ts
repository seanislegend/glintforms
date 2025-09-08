import {describe, expect, it} from 'vitest';
import {isAuthenticityPass} from '@/utils/authenticity';

describe('isAuthenticityPass', () => {
    it('returns true when percentage is at or above threshold', () => {
        expect(isAuthenticityPass(70)).toBe(true);
        expect(isAuthenticityPass(80)).toBe(true);
        expect(isAuthenticityPass(100)).toBe(true);
    });

    it('returns false when percentage is below threshold', () => {
        expect(isAuthenticityPass(69)).toBe(false);
        expect(isAuthenticityPass(50)).toBe(false);
        expect(isAuthenticityPass(0)).toBe(false);
    });

    it('handles decimal values', () => {
        expect(isAuthenticityPass(70.5)).toBe(true);
        expect(isAuthenticityPass(69.9)).toBe(false);
    });
});

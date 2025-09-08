import {describe, expect, it} from 'vitest';
import {COUNTRY_CODE_LABELS} from '@/utils/country-codes';

describe('COUNTRY_CODE_LABELS', () => {
    it('contains expected country codes', () => {
        expect(COUNTRY_CODE_LABELS.GB).toBe('United Kingdom');
        expect(COUNTRY_CODE_LABELS.US).toBe('United States');
        expect(COUNTRY_CODE_LABELS.CA).toBe('Canada');
        expect(COUNTRY_CODE_LABELS.AU).toBe('Australia');
    });

    it('contains all major countries', () => {
        const majorCountries = ['GB', 'US', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'CN'];
        majorCountries.forEach(code => {
            expect(COUNTRY_CODE_LABELS[code]).toBeDefined();
        });
    });

    it('has consistent format for country names', () => {
        Object.values(COUNTRY_CODE_LABELS).forEach(countryName => {
            expect(typeof countryName).toBe('string');
            expect(countryName.length).toBeGreaterThan(0);
        });
    });

    it('has unique country codes', () => {
        const codes = Object.keys(COUNTRY_CODE_LABELS);
        const uniqueCodes = new Set(codes);
        expect(uniqueCodes.size).toBe(codes.length);
    });

    it('has unique country names', () => {
        const names = Object.values(COUNTRY_CODE_LABELS);
        const uniqueNames = new Set(names);
        expect(uniqueNames.size).toBe(names.length);
    });
});

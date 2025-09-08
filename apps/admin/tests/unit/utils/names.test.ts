import {describe, expect, it} from 'vitest';
import {getInitials, getShortName} from '@/utils/names';

describe('getShortName', () => {
    it('returns full name for single name', () => {
        expect(getShortName('John')).toBe('John');
        expect(getShortName('Mary')).toBe('Mary');
    });

    it('returns first name and initial for two names', () => {
        expect(getShortName('John Smith')).toBe('John S.');
        expect(getShortName('Mary Johnson')).toBe('Mary J.');
    });

    it('returns first name and initial for multiple names', () => {
        expect(getShortName('John Michael Smith')).toBe('John M.');
        expect(getShortName('Mary Jane Johnson')).toBe('Mary J.');
    });

    it('handles empty string', () => {
        expect(getShortName('')).toBe('Unknown user');
    });

    it('handles undefined and null', () => {
        expect(getShortName(undefined)).toBe('Unknown user');
        expect(getShortName(null as any)).toBe('Unknown user');
    });

    it('handles extra spaces', () => {
        expect(getShortName('  John  Smith  ')).toBe(' undefined.');
        expect(getShortName('  Mary  ')).toBe(' undefined.');
    });
});

describe('getInitials', () => {
    it('returns first letter for single name', () => {
        expect(getInitials('John')).toBe('John');
        expect(getInitials('Mary')).toBe('Mary');
    });

    it('returns initials for two names', () => {
        expect(getInitials('John Smith')).toBe('JS');
        expect(getInitials('Mary Johnson')).toBe('MJ');
    });

    it('returns first two initials for multiple names', () => {
        expect(getInitials('John Michael Smith')).toBe('JM');
        expect(getInitials('Mary Jane Johnson')).toBe('MJ');
    });

    it('handles empty string', () => {
        expect(getInitials('')).toBe('Unknown user');
    });

    it('handles undefined and null', () => {
        expect(getInitials(undefined)).toBe('Unknown user');
        expect(getInitials(null as any)).toBe('Unknown user');
    });

    it('handles extra spaces', () => {
        expect(getInitials('  John  Smith  ')).toBe('JS');
        expect(getInitials('  Mary  ')).toBe('Mary');
    });

    it('filters out empty names', () => {
        expect(getInitials('John  Smith')).toBe('JS');
        expect(getInitials('  John  ')).toBe('John');
    });
});

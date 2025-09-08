import {describe, expect, it} from 'vitest';
import {generateSlug} from '@/utils/generate-slug';

describe('generateSlug', () => {
    it('converts title to lowercase slug', () => {
        expect(generateSlug('Hello World')).toBe('hello-world');
        expect(generateSlug('SURVEY TITLE')).toBe('survey-title');
    });

    it('removes special characters', () => {
        expect(generateSlug('Hello! World?')).toBe('hello-world');
        expect(generateSlug('Survey @ Title #')).toBe('survey-title');
        expect(generateSlug('Product & Service')).toBe('product-service');
    });

    it('replaces spaces with hyphens', () => {
        expect(generateSlug('Hello World')).toBe('hello-world');
        expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('removes leading and trailing hyphens', () => {
        expect(generateSlug('-Hello World-')).toBe('hello-world');
        expect(generateSlug('---Title---')).toBe('title');
    });

    it('replaces multiple hyphens with single hyphen', () => {
        expect(generateSlug('Hello--World')).toBe('hello-world');
        expect(generateSlug('Title---With---Hyphens')).toBe('title-with-hyphens');
    });

    it('handles empty string', () => {
        expect(generateSlug('')).toBe('');
    });

    it('handles string with only special characters', () => {
        expect(generateSlug('!@#$%^&*()')).toBe('');
        expect(generateSlug('---')).toBe('');
    });

    it('handles string with only spaces', () => {
        expect(generateSlug('   ')).toBe('');
        expect(generateSlug('\t\n')).toBe('');
    });

    it('preserves valid characters', () => {
        expect(generateSlug('Hello-World')).toBe('hello-world');
        expect(generateSlug('Survey123')).toBe('survey123');
        expect(generateSlug('Product_Name')).toBe('product_name');
    });

    it('handles complex real-world examples', () => {
        expect(generateSlug('Customer Satisfaction Survey 2024')).toBe(
            'customer-satisfaction-survey-2024'
        );
        expect(generateSlug('Product Feedback - Q1 Results!')).toBe('product-feedback-q1-results');
        expect(generateSlug('Employee Engagement @ Work')).toBe('employee-engagement-work');
    });
});

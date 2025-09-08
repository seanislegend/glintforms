import {describe, expect, it} from 'vitest';
import {parseRouteSegments} from '@/utils/breadcrumb';

describe('parseRouteSegments', () => {
    it('returns empty object for empty array', () => {
        expect(parseRouteSegments([])).toEqual({});
    });

    it('returns empty object for null or undefined', () => {
        expect(parseRouteSegments(null as any)).toEqual({});
        expect(parseRouteSegments(undefined as any)).toEqual({});
    });

    it('parses valid route segments with uuids', () => {
        const segments = [
            'surveys',
            '123e4567-e89b-12d3-a456-426614174000',
            'responses',
            '987fcdeb-51a2-43d1-9f12-345678901234'
        ];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({
            surveys: ['123e4567-e89b-12d3-a456-426614174000'],
            responses: ['987fcdeb-51a2-43d1-9f12-345678901234']
        });
    });

    it('skips invalid uuids', () => {
        const segments = [
            'surveys',
            'invalid-uuid',
            'responses',
            '987fcdeb-51a2-43d1-9f12-345678901234'
        ];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({
            responses: ['987fcdeb-51a2-43d1-9f12-345678901234']
        });
    });

    it('skips empty ids', () => {
        const segments = ['surveys', '', 'responses', '987fcdeb-51a2-43d1-9f12-345678901234'];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({
            responses: ['987fcdeb-51a2-43d1-9f12-345678901234']
        });
    });

    it('skips whitespace-only ids', () => {
        const segments = ['surveys', '   ', 'responses', '987fcdeb-51a2-43d1-9f12-345678901234'];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({
            responses: ['987fcdeb-51a2-43d1-9f12-345678901234']
        });
    });

    it('handles single segment', () => {
        const segments = ['surveys'];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({});
    });

    it('handles odd number of segments', () => {
        const segments = ['surveys', '123e4567-e89b-12d3-a456-426614174000', 'responses'];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({
            surveys: ['123e4567-e89b-12d3-a456-426614174000']
        });
    });

    it('groups multiple ids for same model', () => {
        const segments = [
            'surveys',
            '123e4567-e89b-12d3-a456-426614174000',
            'surveys',
            '987fcdeb-51a2-43d1-9f12-345678901234'
        ];
        const result = parseRouteSegments(segments);

        expect(result).toEqual({
            surveys: [
                '123e4567-e89b-12d3-a456-426614174000',
                '987fcdeb-51a2-43d1-9f12-345678901234'
            ]
        });
    });
});

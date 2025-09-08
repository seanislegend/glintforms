import {describe, expect, it} from 'vitest';
import {formatDuration, formatDurationToClosestSecond} from '@/utils/time';

describe('formatDuration', () => {
    it('returns empty string for falsy values', () => {
        expect(formatDuration(0)).toBe('');
        expect(formatDuration(null as any)).toBe('');
        expect(formatDuration(undefined as any)).toBe('');
    });

    it('formats minutes less than 1', () => {
        expect(formatDuration(0.5)).toBe('< 1 min');
        expect(formatDuration(0.1)).toBe('< 1 min');
    });

    it('formats minutes less than 60', () => {
        expect(formatDuration(1)).toBe('1 min');
        expect(formatDuration(30)).toBe('30 min');
        expect(formatDuration(59)).toBe('59 min');
    });

    it('formats exact hours', () => {
        expect(formatDuration(60)).toBe('1h');
        expect(formatDuration(120)).toBe('2h');
        expect(formatDuration(180)).toBe('3h');
    });

    it('formats hours and minutes', () => {
        expect(formatDuration(90)).toBe('1h 30m');
        expect(formatDuration(125)).toBe('2h 5m');
        expect(formatDuration(150)).toBe('2h 30m');
    });

    it('handles large durations', () => {
        expect(formatDuration(1440)).toBe('24h'); // 24 hours
        expect(formatDuration(1500)).toBe('25h'); // 25 hours
        expect(formatDuration(1501)).toBe('25h 1m'); // 25 hours 1 minute
    });
});

describe('formatDurationToClosestSecond', () => {
    it('formats seconds less than 1', () => {
        expect(formatDurationToClosestSecond(0.5)).toBe('< 1s');
        expect(formatDurationToClosestSecond(0.1)).toBe('< 1s');
        expect(formatDurationToClosestSecond(0.9)).toBe('< 1s');
    });

    it('formats seconds less than 60', () => {
        expect(formatDurationToClosestSecond(1)).toBe('1s');
        expect(formatDurationToClosestSecond(30)).toBe('30s');
        expect(formatDurationToClosestSecond(59.9)).toBe('60s');
        expect(formatDurationToClosestSecond(45.2)).toBe('45s');
        expect(formatDurationToClosestSecond(45.7)).toBe('46s');
    });

    it('formats exact minutes', () => {
        expect(formatDurationToClosestSecond(60)).toBe('1m');
        expect(formatDurationToClosestSecond(120)).toBe('2m');
        expect(formatDurationToClosestSecond(180)).toBe('3m');
    });

    it('formats minutes and seconds', () => {
        expect(formatDurationToClosestSecond(90)).toBe('1m 30s');
        expect(formatDurationToClosestSecond(125)).toBe('2m 5s');
        expect(formatDurationToClosestSecond(150)).toBe('2m 30s');
        expect(formatDurationToClosestSecond(89.7)).toBe('1m 30s');
        expect(formatDurationToClosestSecond(89.3)).toBe('1m 29s');
    });

    it('formats exact hours', () => {
        expect(formatDurationToClosestSecond(3600)).toBe('1h');
        expect(formatDurationToClosestSecond(7200)).toBe('2h');
        expect(formatDurationToClosestSecond(10800)).toBe('3h');
    });

    it('formats hours and minutes', () => {
        expect(formatDurationToClosestSecond(3660)).toBe('1h 1m');
        expect(formatDurationToClosestSecond(3720)).toBe('1h 2m');
        expect(formatDurationToClosestSecond(5400)).toBe('1h 30m');
        expect(formatDurationToClosestSecond(7320)).toBe('2h 2m');
    });

    it('handles large durations', () => {
        expect(formatDurationToClosestSecond(86400)).toBe('24h'); // 24 hours
        expect(formatDurationToClosestSecond(90000)).toBe('25h'); // 25 hours
        expect(formatDurationToClosestSecond(90060)).toBe('25h 1m'); // 25 hours 1 minute
    });

    it('rounds seconds correctly', () => {
        expect(formatDurationToClosestSecond(30.4)).toBe('30s');
        expect(formatDurationToClosestSecond(30.5)).toBe('31s');
        expect(formatDurationToClosestSecond(30.6)).toBe('31s');
        expect(formatDurationToClosestSecond(89.4)).toBe('1m 29s');
        expect(formatDurationToClosestSecond(89.5)).toBe('1m 30s');
        expect(formatDurationToClosestSecond(89.6)).toBe('1m 30s');
    });

    it('handles edge cases', () => {
        expect(formatDurationToClosestSecond(0)).toBe('< 1s');
        expect(formatDurationToClosestSecond(0.001)).toBe('< 1s');
        expect(formatDurationToClosestSecond(59.999)).toBe('60s');
        expect(formatDurationToClosestSecond(3599.9)).toBe('59m 60s');
        expect(formatDurationToClosestSecond(3600.1)).toBe('1h');
    });
});

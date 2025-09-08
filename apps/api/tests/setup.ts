import {afterEach, beforeEach, vi} from 'vitest';

// mock trigger task usage to avoid external side effects during tests
vi.mock('@/lib/jobs/generate-authenticity-score.js', () => ({
    generateAuthenticityScoreTask: {
        trigger: vi.fn().mockResolvedValue(undefined)
    }
}));

// mock upstash redis to avoid external dependencies during tests
const mockRedis = {
    expire: vi.fn(),
    get: vi.fn(),
    set: vi.fn()
};

vi.mock('@upstash/redis', () => ({
    Redis: vi.fn().mockImplementation(() => mockRedis)
}));

// export mock for use in tests
export {mockRedis};

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

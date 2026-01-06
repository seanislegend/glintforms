import {describe, expect, it} from 'vitest';
import {generateKey, hashText} from '../src/core/keys';

describe('key generator', () => {
    it('generates keys with scope and path', () => {
        const key = generateKey('Save changes', 'apps/admin/src/surveys/settings/page.tsx');
        expect(key).toMatch(/^admin\.surveys\.settings\.[a-f0-9]{7}$/);
    });

    it('generates keys for packages', () => {
        const key = generateKey('Submit', 'packages/form/src/components/submit-button.tsx');
        expect(key).toMatch(/^form\.submitButton\.[a-f0-9]{7}$/);
    });

    it('removes Next.js route groups', () => {
        const key = generateKey('Create', 'apps/admin/src/app/(app)/campaigns/new/page.tsx');
        expect(key).toMatch(/^admin\.campaigns\.new\.[a-f0-9]{7}$/);
    });

    it('removes dynamic segments', () => {
        const key = generateKey(
            'Delete',
            'apps/admin/src/app/(app)/surveys/[surveyId]/settings/page.tsx'
        );
        expect(key).toMatch(/^admin\.surveys\.settings\.[a-f0-9]{7}$/);
    });

    it('generates same hash for same text', () => {
        const hash1 = hashText('Hello world');
        const hash2 = hashText('Hello world');
        expect(hash1).toBe(hash2);
    });

    it('generates different hash for different text', () => {
        const hash1 = hashText('Hello world');
        const hash2 = hashText('Goodbye world');
        expect(hash1).not.toBe(hash2);
    });

    it('generates deterministic keys', () => {
        const key1 = generateKey('Save', 'apps/admin/src/surveys/page.tsx');
        const key2 = generateKey('Save', 'apps/admin/src/surveys/page.tsx');
        expect(key1).toBe(key2);
    });

    it('generates common keys for shared strings', () => {
        const key = generateKey('Last updated', 'common');
        expect(key).toMatch(/^common\.[a-f0-9]{7}$/);
    });

    it('common keys are consistent', () => {
        const key1 = generateKey('Last updated', 'common');
        const key2 = generateKey('Last updated', 'common');
        expect(key1).toBe(key2);
    });
});

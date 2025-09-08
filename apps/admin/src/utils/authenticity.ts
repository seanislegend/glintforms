import {AUTHENTICITY_THRESHOLD} from '@/lib/schemas/constants';

export const isAuthenticityPass = (percentage: number): boolean => {
    return percentage >= AUTHENTICITY_THRESHOLD;
};

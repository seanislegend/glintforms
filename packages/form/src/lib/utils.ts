import {type ClassValue, clsx} from 'clsx';
import {toast} from 'sonner';
import {twMerge} from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const getFirstErrorFromSubmission = (errors: Record<string, any>) => {
    const findFirstError = (obj: any): string | undefined => {
        if (typeof obj === 'object' && obj !== null) {
            // if this object has a message property, it's likely an error
            if ('message' in obj && typeof obj.message === 'string') {
                return obj.message;
            }
            // otherwise, recursively search through all values
            for (const value of Object.values(obj)) {
                const found = findFirstError(value);
                if (found) return found;
            }
        }
        return undefined;
    };

    return findFirstError(errors);
};

export const handleFormError = (error: any) => {
    if (error) {
        const firstError = getFirstErrorFromSubmission(error);
        if (firstError) {
            toast.error(firstError, {id: 'form-error'});
        }
    }
};

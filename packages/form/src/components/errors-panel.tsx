import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';

interface Props {
    className?: string;
    errors?:
        | Record<string, Record<string, {_errors?: string[]}>>
        | {_errors?: string[]}[]
        | {_errors?: string[]}
        | any; // allow for deeply nested structures
    title?: string;
}

const FormErrorsPanel: React.FC<Props> = ({className, errors, title}) => {
    if (!errors) return null;

    // recursive function to extract all error messages from nested structure
    const extractErrors = (obj: any): string[] => {
        if (!obj || typeof obj !== 'object') return [];

        const messages: string[] = [];

        // if this object has _errors, collect them
        if (obj._errors && Array.isArray(obj._errors)) {
            messages.push(...obj._errors);
        }

        // recursively search all nested objects
        for (const value of Object.values(obj)) {
            if (typeof value === 'object' && value !== null) {
                messages.push(...extractErrors(value));
            }
        }

        return messages;
    };

    const errorMessages = extractErrors(errors);

    if (errorMessages.length === 0) return null;

    return (
        <Alert className={className} variant="destructive">
            <AlertTitle>{title || 'An error occurred'}</AlertTitle>
            <AlertDescription>
                <ul className="list-disc list-inside mt-1">
                    {errorMessages.map((message, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: wip
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
};

export default FormErrorsPanel;

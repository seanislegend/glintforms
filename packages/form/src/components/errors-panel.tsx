import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';

interface Props {
    className?: string;
    errors?:
        | Record<string, Record<string, {_errors?: string[]}>>
        | {_errors?: string[]}[]
        | {_errors?: string[]}
        | any; // allow for deeply nested structures
    showList?: boolean;
    title?: string;
}

const FormErrorsPanel: React.FC<Props> = ({className, errors, showList = true, title}) => {
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
            } else if (typeof value === 'string') {
                messages.push(value);
            }
        }

        return messages;
    };

    const errorMessages = extractErrors(errors);

    if (errorMessages.length === 0) return null;

    return (
        <Alert className={className} variant="destructive">
            <AlertTitle className="mb-1">{title || 'An error occurred'}</AlertTitle>
            <AlertDescription>
                {showList ? (
                    <ul className="list-disc list-outside ml-4">
                        {errorMessages.map((message, index) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: wip
                            <li key={index}>{message}</li>
                        ))}
                    </ul>
                ) : (
                    <p>{errorMessages.join(', ')}</p>
                )}
            </AlertDescription>
        </Alert>
    );
};

export default FormErrorsPanel;

'use client';

import {Tooltip, TooltipPopup, TooltipProvider, TooltipTrigger} from '@glint/ui/tooltip';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import {useFormContext} from 'react-hook-form';

const QuestionEditorErrorStatus: React.FC = () => {
    const {formState} = useFormContext();
    const {errors} = formState;

    const humaniseFieldName = (fieldPath: string): string => {
        return (
            fieldPath
                .replace('questions.', '')
                // 'root' is applied to an array if e.g. it has no items
                .replace('.root', '')
                .split('.')
                .map(part => {
                    // handle array indices
                    if (/^\d+$/.test(part)) {
                        return `Question ${parseInt(part) + 1}`;
                    }

                    // convert camelCase and snake_case to readable format
                    return part
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .toLowerCase()
                        .replace(/^\w/, c => c.toUpperCase());
                })
                .join(' → ')
        );
    };

    // collect all error messages recursively
    const collectErrorMessages = (errorObj: any, path = ''): string[] => {
        const messages: string[] = [];

        for (const key in errorObj) {
            if (errorObj[key]) {
                const currentPath = path ? `${path}.${key}` : key;

                if (typeof errorObj[key] === 'object' && errorObj[key].message) {
                    const humanFieldName = humaniseFieldName(currentPath);
                    messages.push(`${humanFieldName}: ${errorObj[key].message}`);
                } else if (typeof errorObj[key] === 'object') {
                    messages.push(...collectErrorMessages(errorObj[key], currentPath));
                }
            }
        }

        return messages;
    };

    const errorMessages = collectErrorMessages(errors);
    const totalErrors = errorMessages.length;

    if (totalErrors === 0) return null;

    return (
        <div className="flex items-center">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger
                        render={
                            <p className="flex items-center gap-1 text-destructive text-sm">
                                <InfoIcon className="!size-4" weight="bold" />
                                {totalErrors} error{totalErrors === 1 ? '' : 's'}
                            </p>
                        }
                    />
                    <TooltipPopup className="max-w-sm">
                        <div className="space-y-3">
                            {errorMessages.map(message => (
                                <div key={message} className="text-sm">
                                    {message}
                                </div>
                            ))}
                        </div>
                    </TooltipPopup>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};

export default QuestionEditorErrorStatus;

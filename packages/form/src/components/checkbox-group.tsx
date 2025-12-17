'use client';

import {Checkbox as BaseCheckbox} from '@base-ui-components/react/checkbox';
import {CheckboxGroup as BaseCheckboxGroup} from '@base-ui-components/react/checkbox-group';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {cn} from '../lib/utils';

const CheckboxGroup: React.FC<React.ComponentProps<typeof BaseCheckboxGroup>> = ({
    className,
    ...props
}) => {
    return (
        <BaseCheckboxGroup
            data-slot="checkbox-group"
            className={cn('grid gap-3', className)}
            {...props}
        />
    );
};

const CheckboxGroupItem: React.FC<React.ComponentProps<typeof BaseCheckbox.Root>> = ({
    className,
    ...props
}) => {
    return (
        <BaseCheckbox.Root
            data-slot="checkbox-group-item"
            className={cn(
                'peer rounded border-input bg-white dark:bg-input/30 data-[checked]:bg-primary data-[checked]:text-primary-foreground dark:data-[checked]:bg-primary data-[checked]:border-input-border focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            <BaseCheckbox.Indicator
                data-slot="checkbox-group-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon className="size-3.5" />
            </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
    );
};

export {CheckboxGroup, CheckboxGroupItem};

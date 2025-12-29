'use client';

import {Checkbox as BaseCheckbox} from '@base-ui-components/react/checkbox';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {cn} from '../lib/utils';

const Checkbox: React.FC<React.ComponentProps<typeof BaseCheckbox.Root>> = ({
    className,
    ...props
}) => {
    return (
        <BaseCheckbox.Root
            data-slot="checkbox"
            className={cn(
                'peer rounded border-input bg-white dark:bg-input/30 data-[checked]:bg-primary data-[checked]:text-primary-foreground dark:data-[checked]:bg-primary data-[checked]:border-input-border focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-5 shrink-0 border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            id={props.name}
            {...props}
        >
            <BaseCheckbox.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon className="size-4" />
            </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
    );
};

export default Checkbox;

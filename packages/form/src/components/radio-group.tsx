'use client';

import {Radio as BaseRadio} from '@base-ui/react/radio';
import {RadioGroup as BaseRadioGroup} from '@base-ui/react/radio-group';
import {CircleIcon} from '@phosphor-icons/react/dist/ssr/Circle';
import {cn} from '../lib/utils';

const RadioGroup: React.FC<React.ComponentProps<typeof BaseRadioGroup>> = ({
    className,
    ...props
}) => {
    return (
        <BaseRadioGroup
            data-slot="radio-group"
            className={cn('grid gap-3', className)}
            {...props}
        />
    );
};

const RadioGroupItem: React.FC<React.ComponentProps<typeof BaseRadio.Root>> = ({
    className,
    ...props
}) => {
    return (
        <BaseRadio.Root
            data-slot="radio-group-item"
            className={cn(
                'border-input-border bg-white text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-5 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            id={props.id}
            {...props}
        >
            <BaseRadio.Indicator
                data-slot="radio-group-indicator"
                className="relative flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <CircleIcon className="fill-primary absolute size-4" weight="fill" />
            </BaseRadio.Indicator>
        </BaseRadio.Root>
    );
};

export {RadioGroup, RadioGroupItem};

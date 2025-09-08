'use client';

import {Select as BaseSelect} from '@base-ui-components/react/select';
import {CaretDownIcon} from '@phosphor-icons/react/dist/ssr/CaretDown';
import {CaretUpIcon} from '@phosphor-icons/react/dist/ssr/CaretUp';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {cn} from '../lib/utils';

const Select = ({...props}: React.ComponentProps<typeof BaseSelect.Root>) => {
    return <BaseSelect.Root data-slot="select" {...props} />;
};

const SelectGroup = ({...props}: React.ComponentProps<typeof BaseSelect.Group>) => {
    return <BaseSelect.Group data-slot="select-group" {...props} />;
};

const SelectValue = ({...props}: React.ComponentProps<typeof BaseSelect.Value>) => {
    return <BaseSelect.Value data-slot="select-value" {...props} />;
};

const SelectTrigger = ({
    className,
    size = 'default',
    children,
    ...props
}: React.ComponentProps<typeof BaseSelect.Trigger> & {
    size?: 'sm' | 'default';
}) => {
    return (
        <BaseSelect.Trigger
            data-slot="select-trigger"
            data-size={size}
            className={cn(
                "border-input rounded data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex items-center justify-between gap-2 border bg-white px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-fit",
                className
            )}
            {...props}
        >
            {children}
            <BaseSelect.Icon render={() => <CaretDownIcon className="size-4 opacity-50" />} />
        </BaseSelect.Trigger>
    );
};

const SelectPopup = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof BaseSelect.Positioner>) => {
    return (
        <BaseSelect.Portal>
            <BaseSelect.Backdrop />
            <BaseSelect.Positioner
                className="outline-none select-none z-50"
                sideOffset={8}
                data-slot="select-positioner"
                {...props}
            >
                <BaseSelect.Popup
                    className={cn(
                        'bg-popover space-y-0.5 rounded text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-[var(--available-height)] min-w-[8rem] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto border shadow-md p-1',
                        'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
                        className
                    )}
                >
                    {children}
                </BaseSelect.Popup>
                <SelectScrollDownArrow />
            </BaseSelect.Positioner>
        </BaseSelect.Portal>
    );
};

const SelectItemText = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseSelect.ItemText>) => {
    return (
        <BaseSelect.ItemText data-slot="select-item-text" className={cn(className)} {...props} />
    );
};

const SelectItem = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof BaseSelect.Item>) => {
    return (
        <BaseSelect.Item
            data-slot="select-item"
            className={cn(
                "focus:bg-accent rounded focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 min-w-[var(--anchor-width)] data-[selected]:bg-accent data-[selected]:text-accent-foreground",
                className
            )}
            {...props}
        >
            <span className="absolute right-2 flex size-3.5 items-center justify-center">
                <BaseSelect.ItemIndicator>
                    <CheckIcon className="size-4" weight="bold" />
                </BaseSelect.ItemIndicator>
            </span>
            <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
        </BaseSelect.Item>
    );
};

const SelectSeparator = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseSelect.Separator>) => {
    return (
        <BaseSelect.Separator
            data-slot="select-separator"
            className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
            {...props}
        />
    );
};

const SelectScrollUpArrow = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseSelect.ScrollUpArrow>) => {
    return (
        <BaseSelect.ScrollUpArrow
            data-slot="select-scroll-up-button"
            className={cn('flex cursor-default items-center justify-center py-1', className)}
            {...props}
        >
            <CaretUpIcon className="size-4" />
        </BaseSelect.ScrollUpArrow>
    );
};

const SelectScrollDownArrow = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseSelect.ScrollDownArrow>) => {
    return (
        <BaseSelect.ScrollDownArrow
            data-slot="select-scroll-down-button"
            className={cn('flex cursor-default items-center justify-center py-1', className)}
            {...props}
        >
            <CaretDownIcon className="size-4" />
        </BaseSelect.ScrollDownArrow>
    );
};

export {
    Select,
    SelectPopup,
    SelectGroup,
    SelectItem,
    SelectItemText,
    SelectScrollDownArrow,
    SelectScrollUpArrow,
    SelectSeparator,
    SelectTrigger,
    SelectValue
};

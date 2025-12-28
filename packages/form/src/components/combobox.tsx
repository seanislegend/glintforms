'use client';

import {Combobox as BaseCombobox} from '@base-ui-components/react/combobox';
import Condition from '@glint/ui/condition';
import {CaretDownIcon} from '@phosphor-icons/react/dist/ssr/CaretDown';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {XIcon} from '@phosphor-icons/react/dist/ssr/X';
import {Fragment} from 'react';
import {cn} from '../lib/utils';
import type {SelectOption} from './select';

export interface ComboboxOption {
    description?: string;
    icon?: React.ElementType;
    label: string;
    value: number | string;
}

const Combobox = ({...props}: React.ComponentProps<typeof BaseCombobox.Root>) => {
    return (
        <BaseCombobox.Root
            data-slot="combobox"
            filter={(itemValue: unknown, query: string) => {
                const option = itemValue as SelectOption;
                if (!option?.value || !query) return false;
                return option?.label?.toLowerCase().includes(query.toLowerCase());
            }}
            {...props}
        />
    );
};

const ComboboxValue = ({...props}: React.ComponentProps<typeof BaseCombobox.Value>) => {
    return <BaseCombobox.Value data-slot="combobox-value" {...props} />;
};

const ComboboxInput = ({className, ...props}: React.ComponentProps<typeof BaseCombobox.Input>) => {
    return (
        <BaseCombobox.Input
            className={cn(
                'file:text-foreground rounded placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input-border flex h-9 w-full min-w-0 border bg-white px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:ring-offset-1 focus-visible:ring-input-border-muted focus-visible:border-input-border-accent focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className
            )}
            data-slot="combobox-input"
            {...props}
        />
    );
};

const ComboboxTrigger = ({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<typeof BaseCombobox.Trigger> & {
    size?: 'sm' | 'default';
}) => {
    return (
        <BaseCombobox.Trigger
            className={cn(
                "border-input focus-visible:ring-offset-1 rounded data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 inline-flex items-center justify-center gap-2 border bg-white px-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            data-slot="combobox-trigger"
            data-size={size}
            {...props}
        >
            <CaretDownIcon className="size-4 opacity-50" />
        </BaseCombobox.Trigger>
    );
};

const ComboboxInputWithTrigger = ({
    className,
    containerRef,
    id,
    multiple,
    placeholder,
    valueToStringLabel,
    ...props
}: React.ComponentProps<typeof ComboboxInput> &
    React.ComponentProps<typeof BaseCombobox.Trigger> & {
        containerRef: React.RefObject<HTMLDivElement | null>;
        multiple?: boolean;
        placeholder: string;
        valueToStringLabel: (value: any) => string;
    }) => {
    return (
        <Condition
            condition={Boolean(multiple)}
            fallbackWrapper={children => children}
            wrapper={() => (
                <BaseCombobox.Chips
                    className={cn(
                        'gap-1 flex-wrap rounded placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input-border flex min-h-9 w-full min-w-0 border bg-white p-1 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                        'focus-visible:ring-offset-1 focus-visible:ring-input-border-muted focus-visible:border-input-border-accent focus-visible:ring-[3px]',
                        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                    )}
                    ref={containerRef}
                >
                    <BaseCombobox.Value>
                        {(values: any[]) => (
                            <Fragment>
                                {values.map(value => (
                                    <BaseCombobox.Chip
                                        key={value.value}
                                        aria-label={value.label}
                                        className="flex items-center gap-1 rounded bg-accent pl-1.5 pr-1 text-sm text-accent-foreground outline-none cursor-default focus-within:bg-primary focus-within:text-primary-foreground min-h-6"
                                    >
                                        {valueToStringLabel(value)}
                                        <BaseCombobox.ChipRemove
                                            aria-label="Remove"
                                            className="rounded p-0.5 text-inherit hover:bg-white hover:bg-shadow [&_svg]:size-3"
                                        >
                                            <XIcon />
                                        </BaseCombobox.ChipRemove>
                                    </BaseCombobox.Chip>
                                ))}
                                <BaseCombobox.Input
                                    className="min-w-12 flex-1 rounded-md border-0 bg-transparent pl-2 text-gray-900 outline-none text-sm"
                                    id={id}
                                    placeholder={values.length > 0 ? '' : placeholder}
                                />
                            </Fragment>
                        )}
                    </BaseCombobox.Value>
                </BaseCombobox.Chips>
            )}
        >
            <ComboboxInput
                className={cn('pr-8', className)}
                data-slot="combobox-input-with-trigger"
                id={id}
                {...props}
            />
            <BaseCombobox.Trigger
                className={cn(
                    "absolute right-3 data-[size=default]:h-9 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 top-1/2 -translate-y-1/2",
                    className
                )}
                data-slot="combobox-trigger"
                {...props}
            >
                <CaretDownIcon className="size-4 opacity-50" />
            </BaseCombobox.Trigger>
        </Condition>
    );
};

const ComboboxClear = ({className, ...props}: React.ComponentProps<typeof BaseCombobox.Clear>) => {
    return (
        <BaseCombobox.Clear
            className={cn(
                'text-muted-foreground hover:text-foreground inline-flex h-9 min-w-9 items-center justify-center rounded border border-input-border bg-white px-2 text-sm shadow-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-input-border-muted focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
                className
            )}
            data-slot="combobox-clear"
            {...props}
        >
            <XIcon className="size-4" />
        </BaseCombobox.Clear>
    );
};

const ComboboxPopup = ({
    anchorRef,
    className,
    children,
    ...props
}: React.ComponentProps<typeof BaseCombobox.Positioner> & {
    anchorRef: React.RefObject<HTMLDivElement | null>;
}) => {
    return (
        <BaseCombobox.Portal>
            <BaseCombobox.Positioner
                className="outline-none z-50"
                data-slot="combobox-positioner"
                sideOffset={4}
                {...(anchorRef ? {anchor: anchorRef} : {})}
                {...props}
            >
                <BaseCombobox.Popup
                    className={cn(
                        'bg-popover space-y-0.5 rounded text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 overflow-x-hidden overflow-y-auto border shadow-md p-1',
                        'max-h-[min(var(--available-height),23rem)] w-[var(--anchor-width)] max-w-[var(--available-width)] origin-[var(--transform-origin)] scroll-pt-2 scroll-pb-2 overscroll-contain',
                        className
                    )}
                >
                    {children}
                </BaseCombobox.Popup>
            </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
    );
};

const ComboboxList = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof BaseCombobox.List>) => {
    return (
        <BaseCombobox.List
            className={cn('outline-none', className)}
            data-slot="combobox-list"
            {...props}
        >
            {children}
        </BaseCombobox.List>
    );
};

const ComboboxListWithItems = ({
    emptyLabel,
    options,
    valueToStringLabel,
    ...props
}: React.ComponentProps<typeof BaseCombobox.List> & {
    emptyLabel?: string;
    options: ComboboxOption[];
    valueToStringLabel: (value: any) => string;
}) => {
    return (
        <>
            <BaseCombobox.Empty className="p-2 text-sm leading-4 text-muted-foreground empty:m-0 empty:p-0">
                {emptyLabel ?? 'No options found.'}
            </BaseCombobox.Empty>
            <BaseCombobox.List {...props} className={cn('space-y-1', props.className)}>
                {(option: any) => (
                    <BaseCombobox.Item
                        key={option.value}
                        className={cn(
                            "hover:bg-muted hover:text-accent-foreground focus:bg-muted rounded focus:text-accent-foreground relative flex cursor-default items-center gap-2 py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-[selected]:bg-accent data-[selected]:text-accent-foreground",
                            '[@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-accent-foreground [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-0 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded [@media(hover:hover)]:[&[data-highlighted]]:before:bg-accent'
                        )}
                        data-slot="combobox-item"
                        value={option.value}
                    >
                        <span className="absolute right-2 flex size-3.5 items-center justify-center">
                            <BaseCombobox.ItemIndicator>
                                <CheckIcon className="size-4" weight="bold" />
                            </BaseCombobox.ItemIndicator>
                        </span>
                        <div className="col-start-2">{option.label}</div>
                    </BaseCombobox.Item>
                )}
            </BaseCombobox.List>
        </>
    );
};

const ComboboxGroup = ({...props}: React.ComponentProps<typeof BaseCombobox.Group>) => {
    return <BaseCombobox.Group data-slot="combobox-group" {...props} />;
};

const ComboboxGroupLabel = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseCombobox.GroupLabel>) => {
    return (
        <BaseCombobox.GroupLabel
            className={cn('px-2 py-1 text-xs text-muted-foreground', className)}
            data-slot="combobox-group-label"
            {...props}
        />
    );
};

const ComboboxItem = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof BaseCombobox.Item>) => {
    return (
        <BaseCombobox.Item
            className={cn(
                "hover:bg-muted hover:text-accent-foreground focus:bg-muted rounded focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 min-w-[var(--anchor-width)] data-[selected]:bg-accent data-[selected]:text-accent-foreground",
                '[@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-accent-foreground [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-black',
                className
            )}
            data-slot="combobox-item"
            {...props}
        >
            <span className="absolute right-2 flex size-3.5 items-center justify-center">
                <BaseCombobox.ItemIndicator>
                    <CheckIcon className="size-4" weight="bold" />
                </BaseCombobox.ItemIndicator>
            </span>
            <span className="flex items-center gap-2">{children}</span>
        </BaseCombobox.Item>
    );
};

const ComboboxItemText = ({className, ...props}: React.ComponentProps<'span'>) => {
    return (
        <span
            className={cn('truncate text-sm text-foreground', className)}
            data-slot="combobox-item-text"
            {...props}
        />
    );
};

const ComboboxSeparator = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseCombobox.Separator>) => {
    return (
        <BaseCombobox.Separator
            className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
            data-slot="combobox-separator"
            {...props}
        />
    );
};

const ComboboxChips = ({className, ...props}: React.ComponentProps<typeof BaseCombobox.Chips>) => {
    return (
        <BaseCombobox.Chips
            className={cn('flex flex-wrap items-center gap-1', className)}
            data-slot="combobox-chips"
            {...props}
        />
    );
};

const ComboboxChip = ({className, ...props}: React.ComponentProps<typeof BaseCombobox.Chip>) => {
    return (
        <BaseCombobox.Chip
            className={cn(
                'bg-muted text-foreground inline-flex items-center gap-2 rounded px-2 py-1 text-xs',
                className
            )}
            data-slot="combobox-chip"
            {...props}
        />
    );
};

const ComboboxChipRemove = ({
    className,
    ...props
}: React.ComponentProps<typeof BaseCombobox.ChipRemove>) => {
    return (
        <BaseCombobox.ChipRemove
            className={cn('text-muted-foreground hover:text-foreground', className)}
            data-slot="combobox-chip-remove"
            {...props}
        >
            <XIcon className="size-3" />
        </BaseCombobox.ChipRemove>
    );
};

export {
    Combobox,
    ComboboxChip,
    ComboboxChipRemove,
    ComboboxChips,
    ComboboxClear,
    ComboboxGroup,
    ComboboxGroupLabel,
    ComboboxInput,
    ComboboxInputWithTrigger,
    ComboboxItem,
    ComboboxItemText,
    ComboboxList,
    ComboboxListWithItems,
    ComboboxPopup,
    ComboboxSeparator,
    ComboboxTrigger,
    ComboboxValue
};

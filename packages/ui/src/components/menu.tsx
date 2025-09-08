'use client';

import {Menu as BaseMenu} from '@base-ui-components/react/menu';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {CircleIcon} from '@phosphor-icons/react/dist/ssr/Circle';
import {cn} from '../lib/utils';
import ArrowSvg from './arrow-svg';

const Menu: React.FC<React.ComponentProps<typeof BaseMenu.Root>> = ({...props}) => {
    return <BaseMenu.Root data-slot="dropdown-menu" {...props} />;
};

const MenuPortal: React.FC<React.ComponentProps<typeof BaseMenu.Portal>> = ({...props}) => {
    return <BaseMenu.Portal data-slot="dropdown-menu-portal" {...props} />;
};

const MenuTrigger: React.FC<React.ComponentProps<typeof BaseMenu.Trigger>> = ({...props}) => {
    return <BaseMenu.Trigger data-slot="dropdown-menu-trigger" {...props} />;
};

const MenuPopup: React.FC<
    React.ComponentProps<typeof BaseMenu.Popup> & {
        positionAlign?: BaseMenu.Positioner.Props['align'];
        positionSide?: BaseMenu.Positioner.Props['side'];
    }
> = ({className, positionAlign = 'start', positionSide = 'bottom', ...props}) => {
    return (
        <BaseMenu.Portal>
            <BaseMenu.Positioner
                align={positionAlign}
                className="max-h-[var(--available-height)] outline-none"
                side={positionSide}
                sideOffset={8}
            >
                <BaseMenu.Popup
                    data-slot="dropdown-menu-content"
                    className={cn(
                        'bg-popover rounded text-popover-foreground data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[var(--available-height)] min-w-[8rem] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto border p-1 shadow-md',
                        className
                    )}
                >
                    <BaseMenu.Arrow className="data-[side=bottom]:top-[-6px] data-[side=left]:right-[-13px] data-[side=left]:rotate-90 data-[side=right]:left-[-13px] data-[side=right]:-rotate-90 data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180">
                        <ArrowSvg />
                    </BaseMenu.Arrow>
                    {props.children}
                </BaseMenu.Popup>
            </BaseMenu.Positioner>
        </BaseMenu.Portal>
    );
};

const MenuGroup: React.FC<React.ComponentProps<typeof BaseMenu.Group>> = ({...props}) => {
    return <BaseMenu.Group data-slot="dropdown-menu-group" {...props} />;
};

const MenuItem: React.FC<
    React.ComponentProps<typeof BaseMenu.Item> & {
        inset?: boolean;
        variant?: 'default' | 'destructive';
    }
> = ({className, inset, variant = 'default', ...props}) => {
    return (
        <BaseMenu.Item
            data-slot="dropdown-menu-item"
            data-inset={inset}
            data-variant={variant}
            className={cn(
                "rounded focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        />
    );
};

const MenuCheckboxItem: React.FC<React.ComponentProps<typeof BaseMenu.CheckboxItem>> = ({
    className,
    children,
    checked,
    ...props
}) => {
    return (
        <BaseMenu.CheckboxItem
            data-slot="dropdown-menu-checkbox-item"
            className={cn(
                "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            checked={checked}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <BaseMenu.CheckboxItemIndicator>
                    <CheckIcon className="size-4" />
                </BaseMenu.CheckboxItemIndicator>
            </span>
            {children}
        </BaseMenu.CheckboxItem>
    );
};

const MenuRadioGroup: React.FC<React.ComponentProps<typeof BaseMenu.RadioGroup>> = ({...props}) => {
    return <BaseMenu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
};

const MenuRadioItem: React.FC<React.ComponentProps<typeof BaseMenu.RadioItem>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <BaseMenu.RadioItem
            data-slot="dropdown-menu-radio-item"
            className={cn(
                "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                className
            )}
            {...props}
        >
            <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
                <BaseMenu.RadioItemIndicator>
                    <CircleIcon className="size-2 fill-current" />
                </BaseMenu.RadioItemIndicator>
            </span>
            {children}
        </BaseMenu.RadioItem>
    );
};

const MenuLabel: React.FC<
    React.ComponentProps<typeof BaseMenu.GroupLabel> & {
        inset?: boolean;
    }
> = ({className, inset, ...props}) => {
    return (
        <BaseMenu.GroupLabel
            data-slot="dropdown-menu-label"
            data-inset={inset}
            className={cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
            {...props}
        />
    );
};

const MenuSeparator: React.FC<React.ComponentProps<typeof BaseMenu.Separator>> = ({
    className,
    ...props
}) => {
    return (
        <BaseMenu.Separator
            data-slot="dropdown-menu-separator"
            className={cn('bg-border -mx-1 my-1 h-px', className)}
            {...props}
        />
    );
};

const MenuShortcut: React.FC<React.ComponentProps<'span'>> = ({className, ...props}) => {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
            {...props}
        />
    );
};

export {
    Menu,
    MenuPortal,
    MenuTrigger,
    MenuPopup,
    MenuGroup,
    MenuLabel,
    MenuItem,
    MenuCheckboxItem,
    MenuRadioGroup,
    MenuRadioItem,
    MenuSeparator,
    MenuShortcut
};

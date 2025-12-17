'use client';

import {mergeProps} from '@base-ui-components/react/merge-props';
import {useRender} from '@base-ui-components/react/use-render';
import {SidebarSimpleIcon} from '@phosphor-icons/react/dist/ssr/SidebarSimple';
import {cva, type VariantProps} from 'class-variance-authority';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import useIsMobile from '../hooks/use-mobile';
import {cn} from '../lib/utils';
import Button from './button';
import {Separator} from './separator';
import {Sheet, SheetDescription, SheetHeader, SheetPopup, SheetTitle} from './sheet';
import {Skeleton} from './skeleton';
import {TooltipProvider} from './tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
    state: 'expanded' | 'collapsed';
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextProps | null>(null);

const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }

    return context;
};

const SidebarProvider: React.FC<
    React.ComponentProps<'div'> & {
        defaultOpen?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
> = ({
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
}) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === 'function' ? value(open) : value;
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            // This sets the cookie to keep the sidebar state.
            // biome-ignore lint/suspicious/noDocumentCookie: wip
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        [setOpenProp, open]
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = useCallback(() => {
        return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
    }, [isMobile, setOpen]);

    // Adds a keyboard shortcut to toggle the sidebar.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-"expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? 'expanded' : 'collapsed';

    const contextValue = useMemo<SidebarContextProps>(
        () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar
        }),
        [state, open, setOpen, isMobile, openMobile, toggleSidebar]
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delay={0}>
                <div
                    data-slot="sidebar-wrapper"
                    style={
                        {
                            '--sidebar-width': SIDEBAR_WIDTH,
                            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                            ...style
                        } as React.CSSProperties
                    }
                    className={cn(
                        'group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    );
};

const Sidebar: React.FC<
    React.ComponentProps<'div'> & {
        side?: 'left' | 'right';
        variant?: 'sidebar' | 'floating' | 'inset';
        collapsible?: 'offcanvas' | 'icon' | 'none';
    }
> = ({
    side = 'left',
    variant = 'sidebar',
    collapsible = 'offcanvas',
    className,
    children,
    ...props
}) => {
    const {isMobile, state, openMobile, setOpenMobile} = useSidebar();

    if (collapsible === 'none') {
        return (
            <div
                data-slot="sidebar"
                className={cn(
                    'bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetPopup
                    data-sidebar="sidebar"
                    data-slot="sidebar"
                    data-mobile="true"
                    className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden"
                    style={{'--sidebar-width': SIDEBAR_WIDTH_MOBILE} as React.CSSProperties}
                    side={side}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>Sidebar</SheetTitle>
                        <SheetDescription>Displays the mobile sidebar.</SheetDescription>
                    </SheetHeader>
                    <div className="flex h-full w-full flex-col">{children}</div>
                </SheetPopup>
            </Sheet>
        );
    }

    return (
        <div
            className="group peer text-sidebar-foreground hidden md:block"
            data-state={state}
            data-collapsible={state === 'collapsed' ? collapsible : ''}
            data-variant={variant}
            data-side={side}
            data-slot="sidebar"
        >
            {/* This is what handles the sidebar gap on desktop */}
            <div
                data-slot="sidebar-gap"
                className={cn(
                    'relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
                    'group-data-[collapsible=offcanvas]:w-0',
                    'group-data-[side=right]:rotate-180',
                    variant === 'floating' || variant === 'inset'
                        ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
                        : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]'
                )}
            />
            <div
                data-slot="sidebar-container"
                className={cn(
                    'fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
                    side === 'left'
                        ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                        : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                    // Adjust the padding for floating and inset variants.
                    variant === 'floating' || variant === 'inset'
                        ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
                        : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l',
                    className
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    data-slot="sidebar-inner"
                    className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

const SidebarTrigger: React.FC<React.ComponentProps<typeof Button>> = ({
    className,
    onClick,
    ...props
}) => {
    const {toggleSidebar} = useSidebar();

    return (
        <button
            className={cn(
                'px-3 py-1.5 my-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded transition-colors duration-200 ease-linear',
                className
            )}
            data-sidebar="trigger"
            data-slot="sidebar-trigger"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                onClick?.(event);
                toggleSidebar();
            }}
            render={<Button />}
            size="icon"
            variant="ghost"
            {...props}
        >
            <SidebarSimpleIcon />
            <span className="sr-only">Toggle Sidebar</span>
        </button>
    );
};

const SidebarRail: React.FC<React.ComponentProps<'button'>> = ({className, ...props}) => {
    const {toggleSidebar} = useSidebar();

    return (
        <button
            data-sidebar="rail"
            data-slot="sidebar-rail"
            aria-label="Toggle Sidebar"
            tabIndex={-1}
            onClick={toggleSidebar}
            title="Toggle Sidebar"
            className={cn(
                'hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex',
                'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
                '[[data-side=left][data-collapsed]_&]:cursor-e-resize [[data-side=right][data-collapsed]_&]:cursor-w-resize',
                'hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full',
                '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
                '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
                className
            )}
            {...props}
        />
    );
};

const SidebarInset: React.FC<React.ComponentProps<'main'>> = ({className, ...props}) => {
    return (
        <main
            data-slot="sidebar-inset"
            className={cn(
                'bg-background ring ring-slate-200 overflow-hidden rounded-xl relative flex w-full flex-1 flex-col',
                'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[collapsed]:ml-2',
                className
            )}
            {...props}
        />
    );
};

const SidebarHeader: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="sidebar-header"
            data-sidebar="header"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
};

const SidebarFooter: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="sidebar-footer"
            data-sidebar="footer"
            className={cn('flex flex-col gap-2 p-2', className)}
            {...props}
        />
    );
};

const SidebarSeparator: React.FC<React.ComponentProps<typeof Separator>> = ({
    className,
    ...props
}) => {
    return (
        <Separator
            data-slot="sidebar-separator"
            data-sidebar="separator"
            className={cn('bg-sidebar-border mx-2 w-auto', className)}
            {...props}
        />
    );
};

const SidebarContent: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="sidebar-content"
            data-sidebar="content"
            className={cn(
                'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
                className
            )}
            {...props}
        />
    );
};

const SidebarGroup: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="sidebar-group"
            data-sidebar="group"
            className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
            {...props}
        />
    );
};

const SidebarGroupLabel: React.FC<useRender.ComponentProps<'div'>> = ({
    className,
    render = <div />,
    ...props
}) => {
    return useRender({
        render,
        props: {
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-slot': 'sidebar-group-label',
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-sidebar': 'group-label',
            className: cn(
                'text-sidebar-foreground/70 ring-ring flex h-8 shrink-0 items-center px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
                className
            ),
            ...props
        }
    });
};

const SidebarGroupAction: React.FC<useRender.ComponentProps<'button'>> = ({
    className,
    // biome-ignore lint/a11y/useButtonType: base ui
    render = <button />,
    ...props
}) => {
    return useRender({
        render,
        props: {
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-slot': 'sidebar-group-action',
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-sidebar': 'group-action',
            className: cn(
                'text-sidebar-foreground ring-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                // Increases the hit area of the button on mobile.
                'after:absolute after:-inset-2 md:after:hidden',
                'group-data-[collapsible=icon]:hidden',
                className
            ),
            ...props
        }
    });
};

const SidebarGroupContent: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="sidebar-group-content"
            data-sidebar="group-content"
            className={cn('w-full text-sm', className)}
            {...props}
        />
    );
};

const SidebarMenu: React.FC<React.ComponentProps<'ul'>> = ({className, ...props}) => {
    return (
        <ul
            data-slot="sidebar-menu"
            data-sidebar="menu"
            className={cn('flex w-full min-w-0 flex-col gap-1', className)}
            {...props}
        />
    );
};

const SidebarMenuItem: React.FC<React.ComponentProps<'li'>> = ({className, ...props}) => {
    return (
        <li
            data-slot="sidebar-menu-item"
            data-sidebar="menu-item"
            className={cn('group/menu-item relative', className)}
            {...props}
        />
    );
};

const sidebarMenuButtonVariants = cva(
    'group peer/menu-button flex w-full items-center gap-2 overflow-hidden p-2 text-left text-sm outline-hidden ring-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[open]:hover:bg-sidebar-accent data-[open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&[href]]:hover:underline [&[href]]:underline-offset-2 rounded',
    {
        variants: {
            variant: {
                default:
                    'data-[active=true]:shadow-xs data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]'
            },
            size: {
                default: 'h-8 text-sm',
                sm: 'h-7 text-xs',
                lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0!'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

const SidebarMenuButton: React.FC<
    useRender.ComponentProps<'button'> & {
        isActive?: boolean;
    } & VariantProps<typeof sidebarMenuButtonVariants>
> = ({
    isActive = false,
    className,
    // biome-ignore lint/a11y/useButtonType: base ui
    render = <button />,
    size = 'default',
    variant = 'default',
    ...props
}) => {
    return useRender({
        render,
        props: mergeProps<'button'>(props, {
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-slot': 'sidebar-menu-button',
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-sidebar': 'menu-button',
            'data-size': size,
            'data-active': isActive,
            className: cn(sidebarMenuButtonVariants({variant, size}), className)
        })
    });
};

const SidebarMenuBadge: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
            className={cn(
                'text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center px-1 text-xs font-medium tabular-nums select-none',
                'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
                'peer-data-[size=sm]/menu-button:top-1',
                'peer-data-[size=default]/menu-button:top-1.5',
                'peer-data-[size=lg]/menu-button:top-2.5',
                'group-data-[collapsible=icon]:hidden',
                className
            )}
            {...props}
        />
    );
};

const SidebarMenuSkeleton: React.FC<
    React.ComponentProps<'div'> & {
        showIcon?: boolean;
    }
> = ({className, showIcon = false, ...props}) => {
    // Random width between 50 to 90%.
    const width = useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn('flex h-8 items-center gap-2 px-2', className)}
            {...props}
        >
            {showIcon && <Skeleton className="size-4" data-sidebar="menu-skeleton-icon" />}
            <Skeleton
                className="h-4 max-w-[var(--skeleton-width)] flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        '--skeleton-width': width
                    } as React.CSSProperties
                }
            />
        </div>
    );
};

const SidebarMenuSub: React.FC<React.ComponentProps<'ul'>> = ({className, ...props}) => {
    return (
        <ul
            data-slot="sidebar-menu-sub"
            data-sidebar="menu-sub"
            className={cn(
                'border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5',
                'group-data-[collapsible=icon]:hidden',
                className
            )}
            {...props}
        />
    );
};

const SidebarMenuSubItem: React.FC<React.ComponentProps<'li'>> = ({className, ...props}) => {
    return (
        <li
            data-slot="sidebar-menu-sub-item"
            data-sidebar="menu-sub-item"
            className={cn('group/menu-sub-item relative', className)}
            {...props}
        />
    );
};

const SidebarMenuSubButton: React.FC<
    useRender.ComponentProps<'a'> & {
        isActive?: boolean;
        size?: 'sm' | 'md';
    }
> = ({
    // biome-ignore lint/a11y/useAnchorContent: base ui
    render = <a />,
    size = 'md',
    isActive = false,
    className,
    ...props
}) => {
    return useRender({
        render,
        props: {
            className: cn(
                'text-sidebar-foreground ring-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                'data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-xs data-[active=true]:text-sidebar-accent-foreground hover:underline underline-offset-2 rounded data-[active=true]:no-underline',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                'group-data-[collapsible=icon]:hidden',
                className
            ),
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-slot': 'sidebar-menu-sub-button',
            'data-sidebar': 'menu-sub-button',
            'data-size': size,
            'data-active': isActive,
            ...props
        }
    });
};

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
};

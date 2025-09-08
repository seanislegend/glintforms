'use client';

import {Dialog as BaseDialog} from '@base-ui-components/react/dialog';
import {XIcon} from '@phosphor-icons/react/dist/ssr/X';
import {cn} from '../lib/utils';

const Dialog: React.FC<React.ComponentProps<typeof BaseDialog.Root>> = ({...props}) => {
    return <BaseDialog.Root data-slot="dialog" {...props} />;
};

const DialogTrigger: React.FC<React.ComponentProps<typeof BaseDialog.Trigger>> = ({...props}) => {
    return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
};

const DialogPortal: React.FC<React.ComponentProps<typeof BaseDialog.Portal>> = ({...props}) => {
    return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
};

const DialogClose: React.FC<React.ComponentProps<typeof BaseDialog.Close>> = ({...props}) => {
    return <BaseDialog.Close data-slot="dialog-close" {...props} />;
};

const DialogBackdrop: React.FC<React.ComponentProps<typeof BaseDialog.Backdrop>> = ({
    className,
    ...props
}) => {
    return (
        <BaseDialog.Backdrop
            data-slot="dialog-overlay"
            className={cn('backdrop-blur-[2px] fixed inset-0 z-50 bg-black/50', className)}
            {...props}
        />
    );
};

const DialogPopup: React.FC<
    React.ComponentProps<typeof BaseDialog.Popup> & {
        showCloseButton?: boolean;
    }
> = ({className, children, showCloseButton = true, ...props}) => {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogBackdrop />
            <BaseDialog.Popup
                data-slot="dialog-content"
                className={cn(
                    'rounded bg-background data-[open]:animate-in data-[closed]:animate-out data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:max-w-lg',
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <BaseDialog.Close
                        data-slot="dialog-close"
                        className="rounded ring-offset-background focus:ring-ring data-[open]:bg-accent data-[open]:text-muted-foreground absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </BaseDialog.Close>
                )}
            </BaseDialog.Popup>
        </DialogPortal>
    );
};

const DialogHeader: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="dialog-header"
            className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
            {...props}
        />
    );
};

const DialogFooter: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="dialog-footer"
            className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
            {...props}
        />
    );
};

const DialogTitle: React.FC<React.ComponentProps<typeof BaseDialog.Title>> = ({
    className,
    ...props
}) => {
    return (
        <BaseDialog.Title
            data-slot="dialog-title"
            className={cn('text-lg leading-none font-semibold', className)}
            {...props}
        />
    );
};

const DialogDescription: React.FC<React.ComponentProps<typeof BaseDialog.Description>> = ({
    className,
    ...props
}) => {
    return (
        <BaseDialog.Description
            data-slot="dialog-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
};

export {
    Dialog,
    DialogClose,
    DialogPopup,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    type DialogBackdrop,
    DialogPortal,
    DialogTitle,
    DialogTrigger
};

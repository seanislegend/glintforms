'use client';

import Button from '@glint/ui/button';
import {
    Dialog,
    DialogClose,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle
} from '@glint/ui/dialog';

interface Props {
    cancelLabel?: string;
    confirmLabel?: string;
    description: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean, reason?: string) => void;
    open: boolean;
    pending?: boolean;
    title: string;
    variant?: 'default' | 'destructive';
}

const ConfirmationDialog: React.FC<React.PropsWithChildren<Props>> = ({
    cancelLabel = 'Cancel',
    children,
    confirmLabel = 'Confirm',
    description,
    onConfirm,
    onOpenChange,
    open,
    pending = false,
    title,
    variant = 'default'
}) => {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false, 'confirm-press');
    };

    return (
        <Dialog open={open} onOpenChange={newOpen => onOpenChange(newOpen, 'unknown')}>
            <DialogPopup>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{description}</DialogDescription>
                {children && <div className="mt-4">{children}</div>}
                <DialogFooter>
                    <DialogClose
                        render={
                            <Button
                                disabled={pending}
                                onClick={() => onOpenChange(false, 'cancel-press')}
                                variant="secondary"
                            />
                        }
                    >
                        {cancelLabel}
                    </DialogClose>
                    <Button onClick={handleConfirm} pending={pending} variant={variant}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
};

export default ConfirmationDialog;

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
    onOpenChange: (open: boolean) => void;
    open: boolean;
    pending?: boolean;
    title: string;
    variant?: 'default' | 'destructive';
}

const ConfirmationDialog: React.FC<Props> = ({
    cancelLabel = 'Cancel',
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
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{description}</DialogDescription>
                <DialogFooter>
                    <DialogClose
                        render={
                            <Button
                                onClick={() => onOpenChange(false)}
                                pending={pending}
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

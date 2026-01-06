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
import {useI18n} from '@/hooks/use-i18n';

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
    cancelLabel,
    children,
    confirmLabel,
    description,
    onConfirm,
    onOpenChange,
    open,
    pending = false,
    title,
    variant = 'default'
}) => {
    const {t} = useI18n();
    const cancel = cancelLabel || t('Cancel');
    const confirm = confirmLabel || t('Confirm');
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
                                variant="accent"
                            />
                        }
                    >
                        {cancel}
                    </DialogClose>
                    <Button onClick={handleConfirm} pending={pending} variant={variant}>
                        {confirm}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
};

export default ConfirmationDialog;

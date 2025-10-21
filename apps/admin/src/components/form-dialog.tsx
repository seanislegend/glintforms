'use client';

import Button from '@glint/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@glint/ui/dialog';
import Spinner from '@glint/ui/spinner';
import {useRouter} from 'next/navigation';
import {useQueryState} from 'nuqs';
import {Suspense, useCallback, useEffect, useState} from 'react';

interface Props {
    description?: string;
    title?: string;
    trigger: React.ReactNode;
}

const FormDialog: React.FC<React.PropsWithChildren<Props>> = ({
    children,
    description,
    title,
    trigger
}) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [redirect, setRedirect] = useQueryState('redirect');
    const [success, setSuccess] = useQueryState('success');

    const handleRedirect = useCallback(() => {
        if (redirect) {
            setTimeout(() => router.push(redirect));
            setRedirect(null);
        }
    }, [redirect, router, setRedirect]);

    useEffect(() => {
        if (success) {
            setIsOpen(false);
            setSuccess(null);
            handleRedirect();
        }
    }, [success, setSuccess, handleRedirect]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={<Button size="sm">{trigger}</Button>} />
            <DialogPopup>
                {title && (
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                )}
                {description && <DialogDescription>{description}</DialogDescription>}
                <Suspense
                    fallback={
                        <div className="h-10 flex items-center justify-center">
                            <Spinner />
                        </div>
                    }
                >
                    {children}
                </Suspense>
            </DialogPopup>
        </Dialog>
    );
};

export default FormDialog;

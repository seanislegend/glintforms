'use client';

import Button from '@glint/ui/button';
import {useI18n} from '@/hooks/use-i18n';
import {TrashIcon} from '@phosphor-icons/react/dist/ssr';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {toast} from 'sonner';
import ConfirmationDialog from '@/components/dialogs/confirmation';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    screenerId: string;
}

const DeleteScreenerDialog: React.FC<Props> = ({screenerId}) => {
    const {t} = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const deleteScreener = useMutation(
        trpc.screeners.delete.mutationOptions({
            onError: error => {
                toast.error(error.message || t('Failed to delete screener'));
            },
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.screeners.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.nav.getAll.queryKey()
                });
                toast.success(t('Screener deleted successfully'));
                router.push('/screeners');
            }
        })
    );

    const handleConfirm = () => {
        deleteScreener.mutate(screenerId);
    };

    return (
        <>
            <ConfirmationDialog
                description={t(
                    'Are you sure you want to delete this screener? This action cannot be undone.'
                )}
                onConfirm={handleConfirm}
                onOpenChange={setIsOpen}
                open={isOpen}
                pending={deleteScreener.isPending}
                title={t('Delete screener')}
                variant="destructive"
            />
            <Button onClick={() => setIsOpen(true)} variant="destructive">
                <TrashIcon />
                {t('Delete screener')}
            </Button>
        </>
    );
};

export default DeleteScreenerDialog;

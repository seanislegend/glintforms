'use client';

import Button from '@glint/ui/button';
import EmptyPanel from '@glint/ui/empty-panel';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
import {useI18n} from '@/hooks/use-i18n';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    campaignId?: string;
    responseId: string;
    surveyId: string;
}

const MissingAuthenticityScore: React.FC<React.PropsWithChildren<Props>> = ({
    campaignId,
    responseId,
    surveyId
}) => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const generateMutation = useMutation(
        trpc.authenticity.generate.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.authenticity.get.queryKey({responseId})
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.responses.getAll.queryKey({surveyId})
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.responses.getStats.queryKey(surveyId)
                });
                toast.success(t('Score generated successfully'));
            }
        })
    );

    return (
        <EmptyPanel
            text={t('Generate an authenticity score to analyse this response')}
            title={t('No authenticity score available')}
        >
            {campaignId && (
                <Button
                    className="mt-4"
                    onClick={() => generateMutation.mutate({responseId, surveyId, campaignId})}
                    pending={generateMutation.isPending}
                >
                    {generateMutation.isPending ? t('Generating...') : t('Generate score')}
                </Button>
            )}
        </EmptyPanel>
    );
};

export default MissingAuthenticityScore;

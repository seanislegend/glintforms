'use client';

import Button from '@glint/ui/button';
import EmptyPanel from '@glint/ui/empty-panel';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {toast} from 'sonner';
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
                toast.success('Score generated successfully');
            }
        })
    );

    return (
        <EmptyPanel
            text="Generate an authenticity score to analyse this response"
            title="No authenticity score available"
        >
            {campaignId && (
                <Button
                    className="mt-4"
                    onClick={() => generateMutation.mutate({responseId, surveyId, campaignId})}
                    pending={generateMutation.isPending}
                >
                    {generateMutation.isPending ? 'Generating...' : 'Generate score'}
                </Button>
            )}
        </EmptyPanel>
    );
};

export default MissingAuthenticityScore;

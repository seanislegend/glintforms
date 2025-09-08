'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@glint/ui/dialog';
import RelativeDate from '@glint/ui/relative-date';
import {zodResolver} from '@hookform/resolvers/zod';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {
    type AuthenticityScoreOverride,
    authenticityScoreOverrideSchema
} from '@/lib/schemas/authenticity';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    defaultValues?: Pick<AuthenticityScoreOverride, 'originalScore'> | null;
    lastUpdated: Date | null;
    responseId: string;
    scoreId: string;
}

const OverrideAuthenticityScore: React.FC<Props> = ({
    defaultValues,
    lastUpdated,
    responseId,
    scoreId
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const queryClient = useQueryClient();
    const trpc = useTRPC();
    const methods = useForm<AuthenticityScoreOverride>({
        resolver: zodResolver(authenticityScoreOverrideSchema),
        defaultValues: {
            id: scoreId,
            originalScore: defaultValues?.originalScore ?? 0,
            overrideReason: ''
        }
    });

    const overrideMutation = useMutation(
        trpc.authenticity.override.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.authenticity.get.queryKey({responseId})
                });
                methods.reset();
                toast.success('Authenticity score overridden successfully');
                setIsDialogOpen(false);
            },
            onError: error => {
                toast.error(error.message);
            }
        })
    );

    const handleFormSubmit: SubmitHandler<AuthenticityScoreOverride> = async data => {
        await overrideMutation.mutateAsync(data);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger
                render={
                    <Button className="w-full" size="sm" variant="outline">
                        <PencilIcon className="w-4 h-4" />
                        Edit
                    </Button>
                }
            />
            <DialogPopup>
                <DialogHeader>
                    <DialogTitle>Override Authenticity Score</DialogTitle>
                    {lastUpdated && (
                        <DialogDescription>
                            Last updated: <RelativeDate date={new Date(lastUpdated)} />
                        </DialogDescription>
                    )}
                </DialogHeader>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                        <div className="space-y-4">
                            <FormField
                                control={methods.control}
                                description="Set the authenticity score percentage (0-100)"
                                fieldProps={{max: '100', min: '0', type: 'number'}}
                                fieldType="input"
                                label="Authenticity Score (%)"
                                name="originalScore"
                            />
                            <FormField
                                control={methods.control}
                                fieldType="textarea"
                                label="Reason"
                                name="overrideReason"
                            />
                        </div>
                        <DialogFooter className="flex mt-4 justify-end gap-2 flex-row">
                            <Button
                                onClick={() => setIsDialogOpen(false)}
                                type="button"
                                variant="secondary"
                            >
                                Cancel
                            </Button>
                            <Button pending={overrideMutation.status === 'pending'} type="submit">
                                Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogPopup>
        </Dialog>
    );
};

export default OverrideAuthenticityScore;

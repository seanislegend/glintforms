'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {zodResolver} from '@hookform/resolvers/zod';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';
import FormDialog from '@/components/form-dialog';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    assignedScreenerIds: string[];
    surveyId: string;
}

const assignScreenerSchema = z.object({
    failureMessage: z.string().optional(),
    screenerId: z.string().uuid()
});

type AssignScreenerForm = z.infer<typeof assignScreenerSchema>;

const AssignScreenerDialog: React.FC<Props> = ({assignedScreenerIds, surveyId}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const {data: allScreeners} = useQuery(trpc.screeners.getAll.queryOptions());

    const assignScreener = useMutation(
        trpc.surveys.assignScreener.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.getScreeners.queryKey(surveyId)
                });
                toast.success('Screener assigned successfully');
            }
        })
    );

    const availableScreeners = allScreeners?.filter(s => !assignedScreenerIds.includes(s.id)) || [];

    const methods = useForm<AssignScreenerForm>({
        resolver: zodResolver(assignScreenerSchema),
        defaultValues: {
            failureMessage: '',
            screenerId: ''
        }
    });

    const handleFormSubmit: SubmitHandler<AssignScreenerForm> = async data => {
        await assignScreener.mutateAsync({
            ...data,
            surveyId
        });
        methods.reset();
    };

    if (availableScreeners.length === 0) {
        return (
            <Button disabled size="sm">
                <PlusIcon />
                Add screener
            </Button>
        );
    }

    return (
        <FormDialog
            title="Assign screener"
            trigger={
                <>
                    <PlusIcon />
                    Add screener
                </>
            }
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}
                    className="space-y-4"
                >
                    <FormField<AssignScreenerForm>
                        control={methods.control}
                        fieldType="select"
                        label="Screener"
                        name="screenerId"
                        options={availableScreeners.map(s => ({
                            label: s.name,
                            value: s.id
                        }))}
                        placeholder="Select a screener..."
                    />
                    <FormField<AssignScreenerForm>
                        control={methods.control}
                        description="Optional custom message to show when this screener fails"
                        fieldType="textarea"
                        label="Failure message"
                        name="failureMessage"
                    />
                    <div className="flex justify-end">
                        <Button pending={assignScreener.status === 'pending'} type="submit">
                            Assign
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </FormDialog>
    );
};

export default AssignScreenerDialog;

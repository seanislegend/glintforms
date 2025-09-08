'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type RespondentUpdate, respondentUpdateSchema} from '@/lib/schemas/respondents';
import {useTRPC} from '@/lib/trpc/react';

interface FormProps {
    respondentId: string;
}

const Form: React.FC<FormProps> = ({respondentId}) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    const {data: respondent, isLoading} = useQuery(trpc.respondents.get.queryOptions(respondentId));

    const updateRespondent = useMutation(
        trpc.respondents.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.nav.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.respondents.get.queryKey(respondentId)
                });
                toast.success('Respondent updated successfully');
                router.replace('/respondents?success=true');
            }
        })
    );

    const methods = useForm<RespondentUpdate>({
        resolver: zodResolver(respondentUpdateSchema),
        defaultValues: {
            email: '',
            name: '',
            notes: '',
            signupSource: ''
        }
    });

    useEffect(() => {
        if (respondent) {
            methods.reset({
                email: respondent.email,
                name: respondent.name,
                notes: respondent.notes || '',
                signupSource: respondent.signupSource || ''
            });
        }
    }, [respondent, methods]);

    const handleFormSubmit: SubmitHandler<RespondentUpdate> = useCallback(
        async data => {
            await updateRespondent.mutateAsync({
                id: respondentId,
                ...data
            });
        },
        [updateRespondent.mutateAsync, respondentId]
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!respondent) {
        return <div>Respondent not found</div>;
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-6">
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label="Name"
                        name="name"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label="Email"
                        name="email"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label="Signup Source"
                        name="signupSource"
                        placeholder="e.g. email campaign, social media, website"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="textarea"
                        label="Notes"
                        name="notes"
                        placeholder="any additional notes about this respondent"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={updateRespondent.status === 'pending'}
                        type="submit"
                    >
                        Update
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default Form;

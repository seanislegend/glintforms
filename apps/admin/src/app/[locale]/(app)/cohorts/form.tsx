'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {t} from '@/lib/i18n';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useQueryState} from 'nuqs';
import {useCallback} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type CohortCreate, cohortCreateSchema} from '@/lib/schemas/cohorts';
import {useTRPC} from '@/lib/trpc/react';

const Form: React.FC = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [, setRedirect] = useQueryState('redirect');
    const [, setSuccess] = useQueryState('success');

    const methods = useForm<CohortCreate>({
        resolver: zodResolver(cohortCreateSchema),
        defaultValues: {
            description: '',
            name: ''
        }
    });

    const createCohort = useMutation(
        trpc.cohorts.create.mutationOptions({
            onSuccess: async response => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.getAll.queryKey()
                });
                toast.success(t('Cohort created successfully'));
                setSuccess('true');
                setRedirect(`/cohorts/${response?.id}`);
            }
        })
    );

    const handleFormSubmit: SubmitHandler<CohortCreate> = useCallback(
        async data => {
            await createCohort.mutateAsync(data);
        },
        [createCohort.mutateAsync]
    );

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-6">
                    <FormField<CohortCreate>
                        control={methods.control}
                        fieldType="input"
                        label={t('Name')}
                        name="name"
                    />
                    <FormField<CohortCreate>
                        control={methods.control}
                        fieldType="input"
                        label={t('Description')}
                        name="description"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={createCohort.status === 'pending'}
                        type="submit"
                    >
                        {t('Submit')}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default Form;

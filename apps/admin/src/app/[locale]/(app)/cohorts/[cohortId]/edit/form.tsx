'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {t} from '@/lib/i18n';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type CohortUpdate, cohortUpdateSchema} from '@/lib/schemas/cohorts';
import {useTRPC} from '@/lib/trpc/react';

interface FormProps {
    cohortId: string;
}

const Form: React.FC<FormProps> = ({cohortId}) => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const {data: cohort, isLoading} = useQuery(trpc.cohorts.get.queryOptions(cohortId));

    const updateCohort = useMutation(
        trpc.cohorts.update.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.cohorts.get.queryKey(cohortId)
                });
                toast.success(t('Cohort updated successfully'));
                router.replace(`/cohorts/${cohortId}?success=true`);
            }
        })
    );

    const methods = useForm<CohortUpdate>({
        resolver: zodResolver(cohortUpdateSchema),
        defaultValues: {
            description: cohort?.description || '',
            name: cohort?.name || ''
        }
    });

    useEffect(() => {
        if (cohort) {
            methods.reset({
                description: cohort.description || '',
                name: cohort.name
            });
        }
    }, [cohort, methods]);

    const handleFormSubmit: SubmitHandler<CohortUpdate> = useCallback(
        async data => {
            await updateCohort.mutateAsync({
                id: cohortId,
                data
            });
        },
        [updateCohort.mutateAsync, cohortId]
    );

    if (isLoading) {
        return <div>{t('Loading...')}</div>;
    }

    if (!cohort) {
        return <div>{t('Cohort not found')}</div>;
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-6">
                    <FormField<CohortUpdate>
                        control={methods.control}
                        fieldType="input"
                        label={t('Name')}
                        name="name"
                    />
                    <FormField<CohortUpdate>
                        control={methods.control}
                        fieldType="input"
                        label={t('Description')}
                        name="description"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={updateCohort.status === 'pending'}
                        type="submit"
                    >
                        {t('Save changes')}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default Form;

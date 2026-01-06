'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import EmptyPanel from '@glint/ui/empty-panel';
import {t} from '@/lib/i18n';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useCallback, useEffect} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import RespondentCohorts from '@/components/respondents/cohorts';
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
                toast.success(t('Respondent updated successfully'));
                router.replace('/respondents?success=true');
            }
        })
    );

    const methods = useForm<RespondentUpdate>({
        resolver: zodResolver(respondentUpdateSchema),
        defaultValues: {
            cohortIds: [],
            email: '',
            name: '',
            notes: ''
        }
    });

    useEffect(() => {
        if (respondent) {
            methods.reset({
                cohortIds: respondent.cohortIds || [],
                email: respondent.email,
                name: respondent.name,
                notes: respondent.notes || ''
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
        return <div>{t('Fetching details...')}</div>;
    } else if (!respondent) {
        return (
            <EmptyPanel
                text={t("The respondent you're looking for doesn't exist or has been removed.")}
                title={t('Respondent not found')}
            />
        );
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <FormField
                            control={methods.control}
                            fieldType="input"
                            label={t('Name')}
                            name="name"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <FormField
                            control={methods.control}
                            fieldType="input"
                            label={t('Email')}
                            name="email"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <FormField
                            control={methods.control}
                            fieldType="textarea"
                            label={t('Notes')}
                            name="notes"
                            placeholder={t('any additional notes about this respondent')}
                        />
                    </div>
                </div>
                <RespondentCohorts />
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={updateRespondent.status === 'pending'}
                        type="submit"
                    >
                        {t('Update')}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default Form;

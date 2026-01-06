'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import Button from '@glint/ui/button';
import {zodResolver} from '@hookform/resolvers/zod';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {t} from '@/lib/i18n';
import {type SurveyUpdate, surveyUpdateSchema} from '@/lib/schemas/surveys';
import {surveyCanBeEdited} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    survey: SurveyDetails;
}

const DetailsStep: React.FC<Props> = ({survey}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const canEdit = surveyCanBeEdited(survey.status);
    const updateSurvey = useMutation(
        trpc.surveys.update.mutationOptions({
            onSuccess: async newSurvey => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.get.queryKey(survey.id)
                });
                if (newSurvey && newSurvey.title !== survey.title) {
                    await queryClient.invalidateQueries({
                        queryKey: trpc.surveys.getAll.queryKey()
                    });
                    await queryClient.invalidateQueries({
                        queryKey: trpc.nav.getAll.queryKey()
                    });
                }
                toast.success(t('Survey details updated successfully'));
            }
        })
    );

    const methods = useForm<SurveyUpdate>({
        resolver: zodResolver(surveyUpdateSchema),
        defaultValues: {
            description: survey.description || '',
            slug: survey.slug || '',
            title: survey.title || ''
        },
        disabled: !canEdit
    });

    const handleFormSubmit: SubmitHandler<SurveyUpdate> = async data => {
        await updateSurvey.mutateAsync({surveyId: survey.id, ...data});
    };

    return (
        <FormProvider {...methods}>
            {!canEdit && (
                <Alert className="mb-6" variant="warning">
                    <InfoIcon />
                    <AlertTitle>{t('Survey is locked')}</AlertTitle>
                    <AlertDescription>
                        {t(
                            'Survey details cannot be changed when the survey is complete or archived.'
                        )}
                    </AlertDescription>
                </Alert>
            )}
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-4">
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label={t('Title')}
                        name="title"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label={t('Slug')}
                        name="slug"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="textarea"
                        label={t('Description')}
                        name="description"
                    />
                </div>
                {canEdit && (
                    <div className="flex justify-end mt-6">
                        <Button pending={updateSurvey.status === 'pending'} type="submit">
                            {t('Save Changes')}
                        </Button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
};

export default DetailsStep;

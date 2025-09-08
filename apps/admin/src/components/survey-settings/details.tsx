'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type SurveyUpdate, surveyUpdateSchema} from '@/lib/schemas/surveys';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    survey: SurveyDetails;
}

const DetailsStep: React.FC<Props> = ({survey}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
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
                toast.success('Survey details updated successfully');
            }
        })
    );

    const methods = useForm<SurveyUpdate>({
        resolver: zodResolver(surveyUpdateSchema),
        defaultValues: {
            description: survey.description || '',
            slug: survey.slug || '',
            title: survey.title || ''
        }
    });

    const handleFormSubmit: SubmitHandler<SurveyUpdate> = async data => {
        await updateSurvey.mutateAsync({id: survey.id, ...data});
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-4">
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label="Title"
                        name="title"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label="Slug"
                        name="slug"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="textarea"
                        label="Description"
                        name="description"
                    />
                </div>
                <div className="flex justify-end mt-6">
                    <Button pending={updateSurvey.status === 'pending'} type="submit">
                        Save Changes
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default DetailsStep;

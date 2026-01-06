'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {t} from '@/lib/i18n';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type SurveyInsert, surveyInsertSchema} from '@/lib/schemas/surveys';
import {useTRPC} from '@/lib/trpc/react';

const Form: React.FC = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const {data: campaigns, isLoading} = useQuery(trpc.campaigns.getAll.queryOptions());
    const createSurvey = useMutation(
        trpc.surveys.create.mutationOptions({
            onSuccess: async data => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.nav.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.getAll.queryKey()
                });
                toast.success(t('Survey created successfully'));
                router.push(`/surveys/${data?.id}?success=true`);
            }
        })
    );
    const methods = useForm<SurveyInsert>({
        resolver: zodResolver(surveyInsertSchema),
        defaultValues: {
            campaignId: '',
            description: '',
            newCampaignTitle: '',
            slug: '',
            title: ''
        }
    });

    const handleFormSubmit: SubmitHandler<SurveyInsert> = async data => {
        await createSurvey.mutateAsync(data);
    };

    const sortedCampaigns = campaigns?.sort((a, b) => a.title.localeCompare(b.title)) || [];

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-3">
                    {sortedCampaigns.length === 0 && !isLoading ? (
                        <FormField
                            control={methods.control}
                            description={t("You don't have any campaigns yet. This will be your first campaign.")}
                            fieldType="input"
                            label={t('Campaign')}
                            name="newCampaignTitle"
                        />
                    ) : (
                        <FormField
                            control={methods.control}
                            fieldType="select"
                            label={t('Campaign')}
                            name="campaignId"
                            options={sortedCampaigns.map(campaign => ({
                                label: campaign.title,
                                value: campaign.id
                            }))}
                            placeholder={t('Select campaign')}
                        />
                    )}
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label={t('Title')}
                        name="title"
                    />
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label={t('Description')}
                        name="description"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={createSurvey.status === 'pending'}
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

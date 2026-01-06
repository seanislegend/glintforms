'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import Button from '@glint/ui/button';
import {t} from '@/lib/i18n';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {useCallback} from 'react';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {type CampaignUpdate, campaignUpdateSchema} from '@/lib/schemas/campaigns';
import {useTRPC} from '@/lib/trpc/react';

const Form: React.FC = () => {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const createCampaign = useMutation(
        trpc.campaigns.create.mutationOptions({
            onSuccess: async response => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.nav.getAll.queryKey()
                });
                await queryClient.invalidateQueries({
                    queryKey: trpc.campaigns.getAll.queryKey()
                });
                toast.success(t('Campaign created successfully'));
                router.replace(`/campaigns?success=true&id=${response?.id}`);
            }
        })
    );
    const methods = useForm<CampaignUpdate>({
        resolver: zodResolver(campaignUpdateSchema),
        defaultValues: {title: ''}
    });

    const handleFormSubmit: SubmitHandler<CampaignUpdate> = useCallback(
        async data => {
            await createCampaign.mutateAsync(data);
        },
        [createCampaign.mutateAsync]
    );

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-6">
                    <FormField
                        control={methods.control}
                        fieldType="input"
                        label={t('Title')}
                        name="title"
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="mt-4"
                        pending={createCampaign.status === 'pending'}
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

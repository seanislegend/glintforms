'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import Button from '@glint/ui/button';
import {BasicCard} from '@glint/ui/card';
import {zodResolver} from '@hookform/resolvers/zod';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {FormProvider, type SubmitHandler, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import PageSpinner from '@/components/page-spinner';
import SurveySecuritySettingsCloseOnResponseLimitField from '@/components/survey-settings/close-on-response-limit-field';
import SurveySecuritySettingsPasswordField from '@/components/survey-settings/password-field';
import {MAX_RESPONSE_HARD_LIMIT} from '@/lib/schemas/constants';
import {type SurveySettings, surveySettingsSchema} from '@/lib/schemas/surveys';
import {surveyCanBeEdited} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';
import {formatNumber} from '@/utils/numbers';

type FormData = SurveySettings & {hasPassword?: boolean};

interface Props {
    survey: SurveyDetails;
}
interface FormProps extends Props {
    settings: SurveySettings | null | undefined;
}

const SurveySecuritySettingsForm: React.FC<FormProps> = ({settings, survey}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const canEdit = surveyCanBeEdited(survey.status);
    const updateSettings = useMutation(
        trpc.surveys.updateSettings.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.get.queryKey(survey.id)
                });
                // reset changePassword state after successful update
                methods.setValue('changePassword', false);
                methods.setValue('password', '');
                toast.success('Survey settings updated successfully');
            }
        })
    );
    const methods = useForm<FormData>({
        resolver: zodResolver(surveySettingsSchema),
        defaultValues: settings ?? {},
        disabled: !canEdit
    });

    const handleFormSubmit: SubmitHandler<FormData> = async data => {
        // biome-ignore lint/correctness/noUnusedVariables: don't need hasPassword
        const {hasPassword, ...submitData} = data;
        await updateSettings.mutateAsync({id: survey.id, ...submitData});
    };

    return (
        <FormProvider {...methods}>
            {!canEdit && (
                <Alert className="mb-6" variant="warning">
                    <InfoIcon />
                    <AlertTitle>Survey is locked</AlertTitle>
                    <AlertDescription>
                        Survey settings cannot be changed when the survey is complete or archived.
                    </AlertDescription>
                </Alert>
            )}
            <form onSubmit={methods.handleSubmit(handleFormSubmit, handleFormError)}>
                <div className="grid gap-4 xl:grid-cols-2">
                    <BasicCard title="Access Controls">
                        <div className="space-y-4">
                            <FormField
                                control={methods.control}
                                fieldType="switch"
                                label="Password protected"
                                name="isPasswordProtected"
                                description="Require users to enter a password to access the survey"
                            />
                            <SurveySecuritySettingsPasswordField />
                            <FormField
                                control={methods.control}
                                fieldType="switch"
                                label="Allow Anonymous Responses"
                                name="allowAnonymous"
                                description="Allow users to submit responses without creating an account"
                            />
                        </div>
                    </BasicCard>
                    <BasicCard title="Response limits">
                        <div className="space-y-4">
                            <FormField
                                control={methods.control}
                                fieldType="input"
                                label="Maximum Responses"
                                name="maxResponses"
                                description={`Maximum number of responses allowed (a hard limit of ${formatNumber(MAX_RESPONSE_HARD_LIMIT)} responses applies by default)`}
                            />
                            <SurveySecuritySettingsCloseOnResponseLimitField />
                        </div>
                    </BasicCard>
                </div>
                {canEdit && (
                    <div className="flex justify-end mt-6">
                        <Button pending={updateSettings.status === 'pending'} type="submit">
                            Save settings
                        </Button>
                    </div>
                )}
            </form>
        </FormProvider>
    );
};

const SurveySecuritySettings: React.FC<Props> = ({survey}) => {
    const trpc = useTRPC();
    const {data, isLoading} = useQuery(trpc.surveys.getSettings.queryOptions(survey.id));

    if (isLoading) {
        return <PageSpinner />;
    }

    return <SurveySecuritySettingsForm settings={data} survey={survey} />;
};

export default SurveySecuritySettings;

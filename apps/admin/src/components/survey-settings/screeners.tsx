'use client';

import {FormField} from '@glint/form/fields';
import {handleFormError} from '@glint/form/utils';
import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import Button from '@glint/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import {InfoIcon, TrashIcon} from '@phosphor-icons/react/dist/ssr';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'sonner';
import ConfirmationDialog from '@/components/dialogs/confirmation';
import {surveyCanBeEdited} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';
import {getScreenerSummary} from '@/utils/screener-summary';
import AssignScreenerDialog from './assign-screener-dialog';

interface Props {
    survey: SurveyDetails;
}

const ScreenersSettings: React.FC<Props> = ({survey}) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const canEdit = surveyCanBeEdited(survey.status);
    const [removingScreenerId, setRemovingScreenerId] = useState<string | null>(null);

    const {data: screeners} = useQuery(trpc.surveys.getScreeners.queryOptions(survey.id));

    const removeScreener = useMutation(
        trpc.surveys.removeScreener.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.getScreeners.queryKey(survey.id)
                });
                toast.success('Screener removed successfully');
            }
        })
    );

    const updateFailureMessage = useMutation(
        trpc.surveys.updateScreenerFailureMessage.mutationOptions({
            onSuccess: async () => {
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.getScreeners.queryKey(survey.id)
                });
                toast.success('Failure message updated successfully');
            }
        })
    );

    const handleRemove = (screenerId: string) => {
        setRemovingScreenerId(screenerId);
    };

    const handleConfirmRemove = () => {
        if (removingScreenerId) {
            removeScreener.mutate({screenerId: removingScreenerId, surveyId: survey.id});
        }
    };

    const handleUpdateFailureMessage = (screenerId: string, failureMessage: string) => {
        updateFailureMessage.mutate({
            failureMessage,
            screenerId,
            surveyId: survey.id
        });
    };

    if (!canEdit) {
        return (
            <Alert variant="warning">
                <InfoIcon />
                <AlertTitle>Survey is locked</AlertTitle>
                <AlertDescription>
                    Screeners cannot be changed when the survey is complete or archived.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <ConfirmationDialog
                description="Are you sure you want to remove this screener?"
                onConfirm={handleConfirmRemove}
                onOpenChange={open => {
                    if (!open) {
                        setRemovingScreenerId(null);
                    }
                }}
                open={removingScreenerId !== null}
                pending={removeScreener.isPending}
                title="Remove screener"
                variant="destructive"
            />
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Screeners</h3>
                    <p className="text-sm text-muted-foreground">
                        Add screeners to filter respondents before they can access this survey. All
                        screeners must pass for a respondent to proceed.
                    </p>
                </div>
                <AssignScreenerDialog
                    assignedScreenerIds={screeners?.map(s => s.id) || []}
                    surveyId={survey.id}
                />
            </div>

            {!screeners || screeners.length === 0 ? (
                <EmptyPanel
                    text="No screeners have been added to this survey yet. Click the button above to add one."
                    title="No screeners assigned"
                />
            ) : (
                <div className="space-y-4">
                    {screeners
                        .sort((a, b) => a.order - b.order)
                        .map(screener => (
                            <Card key={screener.id}>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>
                                            <span>{screener.name}</span>
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {getScreenerSummary(screener)}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => handleRemove(screener.id)}
                                        size="sm"
                                        type="button"
                                        variant="destructiveGhost"
                                    >
                                        <TrashIcon />
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FailureMessageForm
                                        defaultMessage={screener.failureMessage || ''}
                                        onSave={message =>
                                            handleUpdateFailureMessage(screener.id, message)
                                        }
                                    />
                                </CardContent>
                            </Card>
                        ))}
                </div>
            )}
        </div>
    );
};

interface FailureMessageFormProps {
    defaultMessage: string;
    onSave: (message: string) => void;
}

const FailureMessageForm: React.FC<FailureMessageFormProps> = ({defaultMessage, onSave}) => {
    const methods = useForm<{failureMessage: string}>({
        defaultValues: {failureMessage: defaultMessage}
    });

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(
                    data => onSave(data.failureMessage),
                    handleFormError
                )}
            >
                <FormField
                    control={methods.control}
                    description="Custom message to show when this screener fails. Leave empty for default message."
                    fieldType="input"
                    label="Failure message"
                    name="failureMessage"
                />
                <div className="flex justify-end mt-2">
                    <Button size="sm" type="submit">
                        Save message
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
};

export default ScreenersSettings;

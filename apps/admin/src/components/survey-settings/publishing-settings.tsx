'use client';

import ErrorsPanel from '@glint/form/errors-panel';
import {Badge} from '@glint/ui/badge';
import Button from '@glint/ui/button';
import Spacer from '@glint/ui/spacer';
import Spinner from '@glint/ui/spinner';
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperSeparator,
    StepperTitle
} from '@glint/ui/stepper';
import {useI18n} from '@/hooks/use-i18n';
import {ArchiveIcon} from '@phosphor-icons/react/dist/ssr/Archive';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {ChecksIcon} from '@phosphor-icons/react/dist/ssr/Checks';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {RocketLaunchIcon} from '@phosphor-icons/react/dist/ssr/RocketLaunch';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {TestTubeIcon} from '@phosphor-icons/react/dist/ssr/TestTube';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {toast} from 'sonner';
import ConfirmationDialog from '@/components/dialogs/confirmation';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    survey: SurveyDetails;
}

const steps = [
    {status: 'draft', icon: PencilIcon},
    {status: 'testing', icon: TestTubeIcon},
    {status: 'active', icon: SpinnerGapIcon},
    {status: 'complete', icon: ChecksIcon},
    {status: 'archived', icon: ArchiveIcon}
];

const getStepIndex = (status: string) => {
    return steps.findIndex(step => step.status === status) + 1;
};

const SurveyPublishingSettings: React.FC<Props> = ({survey}) => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(getStepIndex(survey.status));

    const updateStatus = useMutation(
        trpc.surveys.updateStatus.mutationOptions({
            onError: () => {
                toast.error(t('Failed to update survey status'));
            },
            onSuccess: async () => {
                setShowConfirmDialog(false);
                setPendingStatus(null);
                await queryClient.invalidateQueries({
                    queryKey: trpc.surveys.get.queryKey(survey.id)
                });
            }
        })
    );

    const handleStatusChange = async (newStatus: string) => {
        await updateStatus.mutateAsync({
            id: survey.id,
            status: newStatus as any
        });
        toast.success(t('Survey status updated successfully'));
        setCurrentStep(getStepIndex(newStatus));
        setShowConfirmDialog(false);
        setPendingStatus(null);
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'draft':
                return t(
                    "Your survey is in draft mode and you can edit questions and settings freely. Once you're ready, you can move to 'testing' to preview and test responses before launching."
                );
            case 'testing':
                return t(
                    "Your survey is in testing mode and you can preview and test responses. You can either move back to 'draft' to make changes or launch the survey."
                );
            case 'active':
                return t(
                    'Your survey is live and collecting responses. You can complete the survey to stop collecting responses or archive the survey. Depending on the survey settings, it may complete automatically.'
                );
            case 'complete':
                return t(
                    'Your survey has been completed and is no longer accepting responses. You can reopen the survey to continue collecting responses.'
                );
            case 'archived':
                return t('Your survey has been archived and is no longer accessible.');
            default:
                return '';
        }
    };

    const getAvailableActions = (status: string) => {
        switch (status) {
            case 'draft':
                return [
                    {
                        icon: TestTubeIcon,
                        label: t('Move to testing'),
                        status: 'testing',
                        variant: 'default'
                    },
                    {
                        icon: RocketLaunchIcon,
                        label: t('Launch survey'),
                        status: 'active',
                        variant: 'secondary'
                    }
                ];
            case 'testing':
                return [
                    {
                        icon: PencilIcon,
                        label: t('Back to draft'),
                        status: 'draft',
                        variant: 'secondary'
                    },
                    {
                        icon: RocketLaunchIcon,
                        label: t('Launch survey'),
                        status: 'active',
                        variant: 'default'
                    }
                ];
            case 'active':
                return [
                    {
                        icon: ChecksIcon,
                        label: t('Complete survey'),
                        status: 'complete',
                        variant: 'default'
                    },
                    {
                        icon: ArchiveIcon,
                        label: t('Archive survey'),
                        status: 'archived',
                        variant: 'destructive'
                    }
                ];
            case 'complete':
                return [
                    {
                        icon: PencilIcon,
                        label: t('Reopen survey'),
                        status: 'active',
                        variant: 'secondary'
                    },
                    {
                        icon: ArchiveIcon,
                        label: t('Archive survey'),
                        status: 'archived',
                        variant: 'destructive'
                    }
                ];
            default:
                return [];
        }
    };

    const availableActions = getAvailableActions(survey.status);

    return (
        <>
            <Stepper
                indicators={{
                    completed: <CheckIcon className="size-4" />,
                    loading: <Spinner size="sm" />
                }}
                onValueChange={setCurrentStep}
                value={currentStep}
            >
                <StepperNav className="gap-4">
                    {steps.map((step, index) => {
                        return (
                            <StepperItem
                                className="relative flex-1 items-start"
                                key={step.status}
                                loading={step.status === 'active'}
                                step={index + 1}
                            >
                                <div className="flex flex-col items-start justify-center gap-2.5 grow">
                                    <StepperIndicator className="size-8 border-2 data-[state=completed]:text-white data-[state=completed]:bg-green-500 data-[state=inactive]:bg-transparent data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground">
                                        <step.icon className="size-4" weight="bold" />
                                    </StepperIndicator>
                                    <div className="flex flex-col items-start gap-1">
                                        <StepperTitle className="text-start text-base font-medium group-data-[state=inactive]/step:text-muted-foreground capitalize">
                                            {step.status}
                                        </StepperTitle>
                                        <div>
                                            {step.status !== 'archived' && (
                                                <Badge
                                                    className="hidden group-data-[state=active]/step:inline-flex"
                                                    size="sm"
                                                    variant="secondary"
                                                >
                                                    {t('In Progress')}
                                                </Badge>
                                            )}
                                            <Badge
                                                className="hidden group-data-[state=completed]/step:inline-flex"
                                                size="sm"
                                                variant="success"
                                            >
                                                {t('Completed')}
                                            </Badge>
                                            {step.status !== 'archived' && (
                                                <Badge
                                                    className="hidden group-data-[state=inactive]/step:inline-flex"
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    {t('Pending')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {steps.length > index + 1 && (
                                    <StepperSeparator className="absolute top-4 inset-x-0 start-9 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none  group-data-[state=completed]/step:bg-green-500" />
                                )}
                            </StepperItem>
                        );
                    })}
                </StepperNav>
            </Stepper>
            <Spacer />
            <p className="text-sm text-muted-foreground">{getStatusDescription(survey.status)}</p>
            <Spacer size="sm" />
            {availableActions.length > 0 && (
                <div className="flex gap-3 animate-in fade-in-0 duration-300" key={survey.status}>
                    {availableActions.map(action => (
                        <Button
                            key={action.status}
                            onClick={() => {
                                setPendingStatus(action.status);
                                setShowConfirmDialog(true);
                            }}
                            pending={updateStatus.status === 'pending'}
                            variant={action.variant as any}
                        >
                            {action.icon && <action.icon className="size-4" />}
                            {action.label}
                        </Button>
                    ))}
                </div>
            )}
            <ConfirmationDialog
                description={t('Are you sure you want to change the survey status?')}
                onConfirm={() => pendingStatus && handleStatusChange(pendingStatus)}
                onOpenChange={(newStatus, reason) => {
                    if (newStatus === false && reason !== 'confirm-press') {
                        setShowConfirmDialog(newStatus);
                        updateStatus.reset();
                    }
                }}
                open={showConfirmDialog}
                pending={updateStatus.status === 'pending'}
                title={t('Confirm status change')}
                variant={pendingStatus === 'archived' ? 'destructive' : 'default'}
            >
                {updateStatus.error && (
                    <ErrorsPanel errors={[updateStatus.error.message]} showList={false} />
                )}
            </ConfirmationDialog>
        </>
    );
};

export default SurveyPublishingSettings;

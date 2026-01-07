'use client';

import {FormField} from '@glint/form/fields';
import Input from '@glint/form/input';
import Button from '@glint/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogPopup,
    DialogTitle,
    DialogTrigger
} from '@glint/ui/dialog';
import {zodResolver} from '@hookform/resolvers/zod';
import {SparkleIcon} from '@phosphor-icons/react/dist/ssr/Sparkle';
import {useMutation} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import {use, useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'sonner';
import {QuestionEditorContext} from '@/components/question-editor/wrapper';
import useHighlight from '@/hooks/use-highlight';
import {useI18n} from '@/hooks/use-i18n';
import {MAX_QUESTIONS} from '@/lib/schemas/constants';
import {type GenerateQuestionsForm, generateQuestionsSchema} from '@/lib/schemas/questions';
import {questionCountAtom} from '@/lib/store';
import {isDraftSurvey} from '@/lib/surveys/disabled-rules';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    isPending: boolean;
    surveyId: string;
}

const GenerateQuestionsDialog: React.FC<Props> = ({isPending, surveyId}) => {
    const {t} = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const {survey} = use(QuestionEditorContext);
    const questionCount = useAtomValue(questionCountAtom);
    const {getValues, setValue} = useFormContext();
    const {highlight} = useHighlight();
    const trpc = useTRPC();
    const isDraft = isDraftSurvey(survey?.status);

    const generateFormMethods = useForm<GenerateQuestionsForm>({
        resolver: zodResolver(generateQuestionsSchema),
        defaultValues: {
            topic: '',
            description: '',
            questionCount: '5'
        }
    });

    const generateQuestions = useMutation(
        trpc.questions.generate.mutationOptions({
            onSuccess: generatedQuestions => {
                const currentQuestions = getValues('questions') || [];
                const updatedQuestions = [...currentQuestions, ...generatedQuestions];
                setValue('questions', updatedQuestions);
                highlight('questions-list');
                toast.success(
                    t(
                        `Generated ${generatedQuestions.length} questions, please review them and save the survey.`
                    )
                );
                setIsOpen(false);
                generateFormMethods.reset();
            },
            onError: error => {
                toast.error(error.message || t('Failed to generate questions'));
            }
        })
    );

    const handleSubmit = generateFormMethods.handleSubmit((data: GenerateQuestionsForm) => {
        const currentQuestions = getValues('questions') || [];
        const remainingSlots = MAX_QUESTIONS - questionCount;

        if (remainingSlots <= 0) {
            toast.error(t('Maximum number of questions reached'));
            return;
        }

        const questionsToGenerate = Math.min(remainingSlots, Number(data.questionCount));

        generateQuestions.mutate({
            description: data.description,
            existingQuestions: currentQuestions,
            questionCount: questionsToGenerate,
            surveyId,
            topic: data.topic
        });
    });

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            generateFormMethods.reset();
        }
    };

    const remainingSlots = MAX_QUESTIONS - questionCount;
    const isDisabled =
        !isDraft || isPending || questionCount === MAX_QUESTIONS || generateQuestions.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button disabled={isDisabled} variant="secondary">
                        <SparkleIcon />
                        {t('Generate questions')}
                    </Button>
                }
            />
            <DialogPopup className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('Generate questions')}</DialogTitle>
                    <DialogDescription>
                        {t(
                            'Describe the topic and context for the questions you want to generate.'
                        )}
                        {remainingSlots < 5 &&
                            ` ${t(`You can generate up to ${remainingSlots} more questions.`)}`}
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...generateFormMethods}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <FormField
                                control={generateFormMethods.control}
                                fieldType="input"
                                label={t('Topic')}
                                name="topic"
                                placeholder={t(
                                    'e.g., Customer satisfaction, Product feedback, Employee engagement'
                                )}
                            />
                            {survey?.description && (
                                <Button
                                    className="mt-2"
                                    onClick={() => {
                                        generateFormMethods.setValue('topic', survey.title ?? '');
                                    }}
                                    size="xs"
                                    variant="accent"
                                >
                                    {t('Use survey title')}
                                </Button>
                            )}
                        </div>
                        <div>
                            <FormField
                                control={generateFormMethods.control}
                                fieldType="textarea"
                                label={t('Description')}
                                name="description"
                                placeholder={t(
                                    'Provide context about what you want to learn, target audience, or specific areas to focus on...'
                                )}
                            ></FormField>
                            {survey?.description && (
                                <Button
                                    className="mt-2"
                                    onClick={() => {
                                        generateFormMethods.setValue(
                                            'description',
                                            survey.description ?? ''
                                        );
                                    }}
                                    size="xs"
                                    variant="accent"
                                >
                                    {t('Use survey description')}
                                </Button>
                            )}
                        </div>
                        <FormField
                            control={generateFormMethods.control}
                            name="questionCount"
                            label={t('Number of questions')}
                            render={({field}) => (
                                <Input type="number" {...field} value={String(field.value ?? '')} />
                            )}
                        />
                    </form>
                </FormProvider>
                <DialogFooter>
                    <Button
                        disabled={generateQuestions.isPending}
                        onClick={() => setIsOpen(false)}
                        variant="accent"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button onClick={handleSubmit} pending={generateQuestions.isPending}>
                        {t('Generate questions')}
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
};

export default GenerateQuestionsDialog;

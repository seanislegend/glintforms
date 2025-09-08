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
import {useState} from 'react';
import {FormProvider, useForm, useFormContext} from 'react-hook-form';
import {toast} from 'sonner';
import useHighlight from '@/hooks/use-highlight';
import {MAX_QUESTIONS} from '@/lib/schemas/constants';
import {type GenerateQuestionsForm, generateQuestionsSchema} from '@/lib/schemas/questions';
import {questionCountAtom} from '@/lib/store';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    isPending: boolean;
    surveyId: string;
}

const GenerateQuestionsDialog: React.FC<Props> = ({isPending, surveyId}) => {
    const [isOpen, setIsOpen] = useState(false);
    const questionCount = useAtomValue(questionCountAtom);
    const {getValues, setValue} = useFormContext();
    const {highlight} = useHighlight();
    const trpc = useTRPC();

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
                toast.success(`Generated ${generatedQuestions.length} questions`);
                setIsOpen(false);
                generateFormMethods.reset();
            },
            onError: error => {
                toast.error(error.message || 'Failed to generate questions');
            }
        })
    );

    const handleSubmit = generateFormMethods.handleSubmit((data: GenerateQuestionsForm) => {
        const currentQuestions = getValues('questions') || [];
        const remainingSlots = MAX_QUESTIONS - questionCount;

        if (remainingSlots <= 0) {
            toast.error('Maximum number of questions reached');
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
    const isDisabled = isPending || questionCount === MAX_QUESTIONS || generateQuestions.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
                render={
                    <Button disabled={isDisabled} variant="accent">
                        <SparkleIcon />
                        Generate questions
                    </Button>
                }
            />
            <DialogPopup className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Generate questions</DialogTitle>
                    <DialogDescription>
                        Describe the topic and context for the questions you want to generate.
                        {remainingSlots < 5 &&
                            ` You can generate up to ${remainingSlots} more questions.`}
                    </DialogDescription>
                </DialogHeader>
                <FormProvider {...generateFormMethods}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FormField
                            control={generateFormMethods.control}
                            fieldType="input"
                            label="Topic"
                            name="topic"
                            placeholder="e.g., Customer satisfaction, Product feedback, Employee engagement"
                        />
                        <FormField
                            control={generateFormMethods.control}
                            fieldType="textarea"
                            label="Description"
                            name="description"
                            placeholder="Provide context about what you want to learn, target audience, or specific areas to focus on..."
                        />
                        <FormField
                            control={generateFormMethods.control}
                            name="questionCount"
                            label="Number of questions"
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
                        variant="secondary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} pending={generateQuestions.isPending}>
                        Generate questions
                    </Button>
                </DialogFooter>
            </DialogPopup>
        </Dialog>
    );
};

export default GenerateQuestionsDialog;

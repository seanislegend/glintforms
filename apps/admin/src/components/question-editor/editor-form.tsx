'use client';

import {handleFormError} from '@glint/form/utils';
import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import Button from '@glint/ui/button';
import Container from '@glint/ui/container';
import EmptyPanel from '@glint/ui/empty-panel';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {InfoIcon} from '@phosphor-icons/react/dist/ssr/Info';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useSetAtom} from 'jotai';
import {use} from 'react';
import {type SubmitHandler, useFieldArray, useFormContext} from 'react-hook-form';
import {toast} from 'sonner';
import {isDraftSurvey} from '@/lib/disabled-rules';
import type {Question, QuestionsUpdate} from '@/lib/schemas/questions';
import {questionCountAtom} from '@/lib/store';
import {surveyHasLaunched} from '@/lib/survey';
import {useTRPC} from '@/lib/trpc/react';
import QuestionCard from './card';
import QuestionCardSkeleton from './card-skeleton';
import ExportQuestionsDialog from './export-questions';
import Footer from './footer';
import GenerateQuestionsDialog from './generate-questions-dialog';
import ImportQuestionsDialog from './import-questions';
import QuestionProvider from './provider';
import RemoveQuestionDialog from './remove-question-dialog';
import useQuestionEditor from './use-question-editor';
import {QuestionEditorContext} from './wrapper';

const QuestionEditorForm: React.FC = () => {
    const {control, handleSubmit} = useFormContext<QuestionsUpdate>();
    const fieldArray = useFieldArray({control, name: 'questions'});
    const {getNewQuestion, normaliseQuestions, surveyId} = useQuestionEditor();
    const {isPending, survey} = use(QuestionEditorContext);
    const setQuestionCount = useSetAtom(questionCountAtom);
    const isDraft = isDraftSurvey(survey?.status);

    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const saveQuestions = useMutation(
        trpc.questions.update.mutationOptions({
            onSuccess: async result => {
                if (!result.success) {
                    toast.error(result.error);
                    return;
                }

                await queryClient.invalidateQueries({
                    queryKey: [
                        trpc.questions.getAll.queryKey(surveyId),
                        trpc.actions.getAll.queryKey(surveyId),
                        trpc.activities.getAll.queryKey(surveyId)
                    ]
                });
                toast.success('Questions updated');
            }
        })
    );

    const handleAddQuestion = () => {
        const newQuestion = getNewQuestion();
        fieldArray.append(newQuestion);
        setQuestionCount(prev => prev + 1);
    };

    const handleFormSubmit: SubmitHandler<QuestionsUpdate> = async data => {
        await saveQuestions.mutateAsync({
            ...data,
            questions: normaliseQuestions(data.questions)
        });
    };

    const handleImportQuestions = (questions: Question[]) => {
        console.log('questions', questions);
        // todo: handle passing data up to the parent component
        window.location.reload();
    };

    return (
        <Container>
            <SectionHeader
                actions={
                    fieldArray.fields.length > 0 && (
                        <>
                            {isDraft && (
                                <GenerateQuestionsDialog
                                    isPending={isPending}
                                    surveyId={surveyId}
                                />
                            )}
                            <ExportQuestionsDialog surveyId={surveyId} />
                        </>
                    )
                }
                text="Manage your survey questions and their options"
                title="Question editor"
            />
            <Spacer />
            {survey?.status && surveyHasLaunched(survey.status) && (
                <>
                    <Alert variant="warning">
                        <InfoIcon />
                        <AlertTitle>Survey has been published</AlertTitle>
                        <AlertDescription>
                            Your survey has been published and you can only edit the text content of
                            existing questions and options. Structural changes such as adding or
                            removing questions, changing question types, or modifying options are
                            not allowed to ensure the integrity of the survey.
                        </AlertDescription>
                    </Alert>
                    <Spacer />
                </>
            )}
            {isPending ? (
                <div className="space-y-6">
                    <QuestionCardSkeleton />
                    <QuestionCardSkeleton />
                    <QuestionCardSkeleton />
                </div>
            ) : (
                <form
                    className="space-y-6"
                    onSubmit={handleSubmit(handleFormSubmit, handleFormError)}
                >
                    {fieldArray.fields.length === 0 && (
                        <EmptyPanel
                            text="Add questions to your survey to get started. If you're not sure what
                                to add, you can generate questions using our AI powered question
                                generator."
                            title="No questions added yet"
                        >
                            <div className="flex items-center gap-2 justify-center">
                                {isDraft && (
                                    <>
                                        <GenerateQuestionsDialog
                                            isPending={isPending}
                                            surveyId={surveyId}
                                        />
                                        <ImportQuestionsDialog
                                            onImport={handleImportQuestions}
                                            surveyId={surveyId}
                                        />
                                        <Button onClick={handleAddQuestion} variant="accent">
                                            <PlusIcon />
                                            Add question
                                        </Button>
                                    </>
                                )}
                            </div>
                        </EmptyPanel>
                    )}
                    {fieldArray.fields.length > 0 && (
                        <>
                            {fieldArray.fields.map((field, index) => (
                                <QuestionProvider key={field.id} questionIndex={index}>
                                    <QuestionCard />
                                </QuestionProvider>
                            ))}

                            <Footer
                                isDraft={isDraft}
                                isPending={saveQuestions.isPending}
                                onAdd={handleAddQuestion}
                            />
                            {isDraft && <RemoveQuestionDialog onRemove={fieldArray.remove} />}
                        </>
                    )}
                </form>
            )}
        </Container>
    );
};

export default QuestionEditorForm;

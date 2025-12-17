'use client';

import Button from '@glint/ui/button';
import {FloppyDiskIcon} from '@phosphor-icons/react/dist/ssr/FloppyDisk';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {useAtomValue} from 'jotai';
import {use} from 'react';
import {useFormContext} from 'react-hook-form';
import {QuestionEditorContext} from '@/components/question-editor/wrapper';
import SortItemsDialog, {type SortItem} from '@/components/sort-items';
import useHighlight from '@/hooks/use-highlight';
import type {Question} from '@/lib/schemas/questions';
import {questionCountAtom} from '@/lib/store';
import {getReorderButtonDisabledReason} from '@/lib/surveys/disabled-rules';
import {surveyCanBeEdited} from '@/lib/surveys/status';
import ErrorStatus from './error-status';

interface Props {
    isDraft: boolean;
    isPending: boolean;
    onAdd: () => void;
}

const QuestionEditorFooter: React.FC<Props> = ({isDraft, isPending, onAdd}) => {
    const {survey} = use(QuestionEditorContext);
    const {getValues, setValue} = useFormContext();
    const questionCount = useAtomValue(questionCountAtom);
    const {highlight} = useHighlight();
    const canEdit = surveyCanBeEdited(survey?.status);

    const handleReorderQuestions = (questions: SortItem[]) => {
        const updatedQuestions = questions.map((question, index) => ({
            ...question,
            order: index
        }));
        setValue('questions', updatedQuestions);
        highlight('questions-list');
    };

    return (
        <div className="flex gap-4 flex-col sm:flex-row justify-between items-center sticky bottom-0 p-4 lg:p-6 -mb-6 bg-white/70 backdrop-blur-lg -mx-4 lg:-mx-6 border-t border-border z-20 self-start">
            <div className="flex flex-col sm:flex-row gap-2">
                {isDraft && (
                    <Button onClick={onAdd} variant="accent">
                        <PlusIcon />
                        Add question
                    </Button>
                )}
                {isDraft && questionCount > 1 && (
                    <SortItemsDialog
                        ctaLabel="Reorder questions"
                        description="Drag and drop questions to change their order. The order will be saved when you click 'Save order'."
                        disabledReason={getReorderButtonDisabledReason(survey?.status)}
                        getItems={() => {
                            const questions = getValues('questions');
                            return questions.map((question: Question, index: number) => ({
                                ...question,
                                order: index
                            }));
                        }}
                        onSorted={handleReorderQuestions}
                        title="Reorder questions"
                    />
                )}
                <ErrorStatus />
            </div>
            {canEdit && (
                <Button pending={isPending} type="submit">
                    <FloppyDiskIcon />
                    Save questions
                </Button>
            )}
        </div>
    );
};

export default QuestionEditorFooter;

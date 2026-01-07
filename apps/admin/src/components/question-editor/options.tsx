'use client';

import {FormField} from '@glint/form/fields';
import Button from '@glint/ui/button';
import {Heading4} from '@glint/ui/heading';
import Spacer from '@glint/ui/spacer';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {PlusIcon} from '@phosphor-icons/react/dist/ssr/Plus';
import {TrashIcon} from '@phosphor-icons/react/dist/ssr/Trash';
import {use} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import SortItemsDialog, {type SortItem} from '@/components/sort-items';
import useHighlight from '@/hooks/use-highlight';
import {useI18n} from '@/hooks/use-i18n';
import {MAX_QUESTION_OPTIONS} from '@/lib/schemas/constants';
import type {QuestionOption, QuestionsUpdate} from '@/lib/schemas/questions';
import {isDraftSurvey} from '@/lib/surveys/disabled-rules';
import HighlightChange from '../highlight-change';
import {QuestionContext} from './provider';
import useQuestionEditor from './use-question-editor';
import {QuestionEditorContext} from './wrapper';

const QuestionOptions: React.FC = () => {
    const {t} = useI18n();
    const {questionIndex} = use(QuestionContext);
    const {survey} = use(QuestionEditorContext);
    const {control, getValues, setValue} = useFormContext<QuestionsUpdate>();
    const questionType = useWatch({name: `questions.${questionIndex}.type`});
    const {append, fields, remove} = useFieldArray({
        name: `questions.${questionIndex}.options`
    });
    const {getNewOption, isCodedQuestion} = useQuestionEditor();
    const {highlight} = useHighlight();
    const isDraft = isDraftSurvey(survey?.status);

    const handleReorderOptions = (options: SortItem[]) => {
        const updatedOptions = options.map((option, index) => ({
            ...option,
            order: index
        }));
        setValue(`questions.${questionIndex}.options`, updatedOptions);
        highlight(`options-${questionIndex}`);
    };

    const canAddOption = fields.length < MAX_QUESTION_OPTIONS;
    const showOptions = isCodedQuestion(questionType);

    return (
        <ToggleVisibility visible={showOptions}>
            <Spacer size="sm" />
            <HighlightChange id={`options-${questionIndex}`}>
                <Heading4>{t('Answer options')}</Heading4>
                <div className="space-y-2 mb-4">
                    {fields.map((option, optionIndex) => {
                        return (
                            <div
                                key={option.id}
                                className="flex gap-4 flex-row items-start animate-in fade-in"
                            >
                                <div className="w-[calc(100%-40px)]">
                                    <FormField
                                        control={control}
                                        fieldType="input"
                                        name={`questions.${questionIndex}.options.${optionIndex}.value`}
                                        placeholder={t('Enter option value')}
                                    />
                                </div>
                                {isDraft && (
                                    <Button
                                        className="w-[40px] !px-4"
                                        onClick={() => remove(optionIndex)}
                                        size="sm"
                                        variant="destructiveGhost"
                                    >
                                        <TrashIcon />
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-row gap-2">
                    {isDraft && (
                        <Button
                            disabled={!canAddOption}
                            onClick={() => append(getNewOption())}
                            variant="accent"
                        >
                            <PlusIcon />
                            Add option
                        </Button>
                    )}
                    {isDraft && fields.length > 1 && (
                        <SortItemsDialog
                            ctaLabel={t('Reorder options')}
                            description={t(
                                "Drag and drop options to change their order. The order will be saved when you click 'Save order'."
                            )}
                            getItems={() => {
                                const options = getValues(`questions.${questionIndex}.options`);
                                return options.map((option: QuestionOption, index: number) => ({
                                    ...option,
                                    order: index
                                }));
                            }}
                            onSorted={handleReorderOptions}
                            title={t('Reorder options')}
                        />
                    )}
                </div>
                <div className="h-4" />
            </HighlightChange>
        </ToggleVisibility>
    );
};

export default QuestionOptions;

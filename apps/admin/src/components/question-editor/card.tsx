'use client';

import {FormField} from '@glint/form/fields';
import Button from '@glint/ui/button';
import {Card, CardContent, CardHeader} from '@glint/ui/card';
import {Heading3} from '@glint/ui/heading';
import {TrashIcon} from '@phosphor-icons/react/dist/ssr/Trash';
import {useSetAtom} from 'jotai';
import {use} from 'react';
import {useFormContext} from 'react-hook-form';
import {removeQuestionIndexAtom} from '@/lib/store';
import HighlightChange from '../highlight-change';
import QuestionOptions from './options';
import {QuestionContext} from './provider';
import QuestionRequiredStatus from './required-status';
import Settings from './settings';
import QuestionTypeSelect from './type-select';

const QuestionCard: React.FC = () => {
    const {control} = useFormContext();
    const {questionIndex} = use(QuestionContext);
    const setRemoveQuestionIndex = useSetAtom(removeQuestionIndexAtom);

    return (
        <HighlightChange id="questions-list">
            <Card className="p-0 overflow-hidden animate-in fade-in">
                <CardContent className="p-0 space-y-4 lg:space-y-6 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-x-4">
                    <div className="xl:col-span-8 space-y-4 xl:space-y-0 p-6">
                        <CardHeader className="p-0 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="inline-flex flex-row gap-x-4">
                                    <Heading3 className="text-lg">
                                        Question {questionIndex + 1}
                                    </Heading3>
                                    <span>
                                        <QuestionRequiredStatus />
                                    </span>
                                </div>
                                <Button
                                    className="ml-auto"
                                    onClick={() => setRemoveQuestionIndex(questionIndex)}
                                    size="sm"
                                    variant="destructiveGhost"
                                >
                                    <TrashIcon />
                                </Button>
                            </div>
                        </CardHeader>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-6 lg:col-span-8 2xl:col-span-9">
                                <FormField
                                    fieldType="input"
                                    label="Title"
                                    control={control}
                                    name={`questions.${questionIndex}.title`}
                                />
                            </div>
                            <div className="md:col-span-6 lg:col-span-4 2xl:col-span-3">
                                <QuestionTypeSelect />
                            </div>
                            <div className="md:col-span-12 2xl:col-span-12">
                                <FormField
                                    fieldType="input"
                                    label="Description"
                                    control={control}
                                    name={`questions.${questionIndex}.description`}
                                />
                            </div>
                        </div>
                        <QuestionOptions />
                    </div>
                    <div className="xl:col-span-4 bg-muted p-6">
                        <Settings />
                    </div>
                </CardContent>
            </Card>
        </HighlightChange>
    );
};

export default QuestionCard;

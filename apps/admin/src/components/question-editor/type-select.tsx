'use client';

import {FormField} from '@glint/form/fields';
import {Select, SelectItem, SelectPopup, SelectTrigger, SelectValue} from '@glint/form/select';
import {CheckSquareIcon} from '@phosphor-icons/react/dist/ssr/CheckSquare';
import {HashIcon} from '@phosphor-icons/react/dist/ssr/Hash';
import {ListChecksIcon} from '@phosphor-icons/react/dist/ssr/ListChecks';
import {TextAaIcon} from '@phosphor-icons/react/dist/ssr/TextAa';
import {use} from 'react';
import {useFormContext} from 'react-hook-form';
import type {QuestionsUpdate, QuestionType} from '@/lib/schemas/questions';
import {QuestionContext} from './provider';

const questionTypes: {value: QuestionType; label: string; icon: React.ReactNode}[] = [
    {value: 'text', label: 'Text input', icon: <TextAaIcon className="h-4 w-4" />},
    {value: 'number', label: 'Number input', icon: <HashIcon className="h-4 w-4" />},
    {value: 'single_select', label: 'Single select', icon: <CheckSquareIcon className="h-4 w-4" />},
    {value: 'multi_select', label: 'Multi select', icon: <ListChecksIcon className="h-4 w-4" />}
];

const QuestionTypeSelect: React.FC = () => {
    const {questionIndex} = use(QuestionContext);
    const {control} = useFormContext<QuestionsUpdate>();

    return (
        <FormField
            label="Type"
            control={control}
            name={`questions.${questionIndex}.type`}
            render={({field}) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="2xl:w-full">
                        <SelectValue>
                            <span className="flex items-center gap-2">
                                {questionTypes.find(type => type.value === field.value)?.icon}
                                {questionTypes.find(type => type.value === field.value)?.label}
                            </span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectPopup>
                        {questionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                    {type.icon}
                                    {type.label}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectPopup>
                </Select>
            )}
        />
    );
};

export default QuestionTypeSelect;

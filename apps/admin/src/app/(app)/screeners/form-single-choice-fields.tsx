'use client';

import {FormField} from '@glint/form/fields';
import {LABEL_CLASSNAME} from '@glint/form/label';
import Button from '@glint/ui/button';
import {cn} from '@glint/ui/utils';
import {PlusIcon, TrashIcon} from '@phosphor-icons/react/dist/ssr';
import {useMemo, useState} from 'react';
import type {Control} from 'react-hook-form';
import {useFormContext, useWatch} from 'react-hook-form';
import type {ScreenerCreate} from '@/lib/schemas/screeners';

interface CorrectOptionSelectProps {
    control: Control<ScreenerCreate>;
    optionIds: Array<{id: string; tempId: string}>;
}

const CorrectOptionSelect: React.FC<CorrectOptionSelectProps> = ({control, optionIds}) => {
    const allOptions = useWatch({control, name: 'config.options'}) || [];
    const options = useMemo(
        () =>
            optionIds.map((opt, index) => {
                const optionValue = allOptions[index]?.value || '';
                return {
                    label: optionValue || `Option ${index + 1}`,
                    value: opt.id
                };
            }),
        [allOptions, optionIds]
    );

    return (
        <FormField<ScreenerCreate>
            control={control}
            defaultValue=""
            fieldType="select"
            label="Correct option"
            name="config.correctOptionId"
            options={options}
        />
    );
};

interface Props {
    defaultOptionIds?: Array<{id: string; tempId: string}>;
}

const SingleChoiceFields: React.FC<Props> = ({defaultOptionIds}) => {
    const methods = useFormContext<ScreenerCreate>();
    const [optionIds, setOptionIds] = useState<Array<{id: string; tempId: string}>>(
        defaultOptionIds || [{id: crypto.randomUUID(), tempId: crypto.randomUUID()}]
    );

    const addOption = () => {
        const newId = crypto.randomUUID();
        setOptionIds([...optionIds, {id: newId, tempId: newId}]);
        const currentOptions = methods.getValues('config.options') || [];
        methods.setValue('config.options', [...currentOptions, {id: newId, value: ''}]);
    };

    const removeOption = (index: number) => {
        const newOptionIds = optionIds.filter((_, i) => i !== index);
        setOptionIds(newOptionIds);
        const currentOptions = methods.getValues('config.options') || [];
        methods.setValue(
            'config.options',
            currentOptions.filter((_, i) => i !== index)
        );
    };

    return (
        <>
            <FormField<ScreenerCreate>
                control={methods.control}
                fieldType="input"
                label="Question"
                name="config.question"
            />
            <span className={cn(LABEL_CLASSNAME, 'mb-2')}>Options</span>
            <div className="space-y-2">
                {optionIds.map((opt, index) => (
                    <div className="flex gap-2" key={opt.tempId}>
                        <div className="flex-grow">
                            <FormField<ScreenerCreate>
                                control={methods.control}
                                fieldType="input"
                                name={`config.options.${index}.value`}
                            />
                        </div>
                        {optionIds.length > 2 && (
                            <Button
                                className="mt-6"
                                onClick={() => removeOption(index)}
                                size="sm"
                                type="button"
                                variant="destructiveGhost"
                            >
                                <TrashIcon />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
            <Button onClick={addOption} size="sm" type="button" variant="secondary">
                <PlusIcon />
                Add option
            </Button>
            <CorrectOptionSelect control={methods.control} optionIds={optionIds} />
        </>
    );
};

export default SingleChoiceFields;

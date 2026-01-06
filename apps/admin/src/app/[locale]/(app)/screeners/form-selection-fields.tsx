'use client';

import {FormField} from '@glint/form/fields';
import {LABEL_CLASSNAME} from '@glint/form/label';
import Button from '@glint/ui/button';
import {cn} from '@glint/ui/utils';
import {t} from '@/lib/i18n';
import {PlusIcon, TrashIcon} from '@phosphor-icons/react/dist/ssr';
import {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import type {ScreenerCreate} from '@/lib/schemas/screeners';

interface Props {
    defaultOptionIds?: Array<{id: string; tempId: string}>;
}

const SelectionFields: React.FC<Props> = ({defaultOptionIds}) => {
    const methods = useFormContext<ScreenerCreate>();
    const [optionIds, setOptionIds] = useState<Array<{id: string; tempId: string}>>(
        defaultOptionIds || [{id: crypto.randomUUID(), tempId: crypto.randomUUID()}]
    );

    const addOption = () => {
        const newId = crypto.randomUUID();
        setOptionIds([...optionIds, {id: newId, tempId: newId}]);
        const currentOptions = methods.getValues('config.options') || [];
        methods.setValue('config.options', [
            ...currentOptions,
            {id: newId, passes: false, value: ''}
        ]);
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
                label={t('Question')}
                name="config.question"
            />
            <span className={cn(LABEL_CLASSNAME, 'mb-2')}>{t('Options')}</span>
            <div className="space-y-2">
                {optionIds.map((opt, index) => (
                    <div className="flex items-center gap-2" key={opt.tempId}>
                        <div className="flex-grow pr-4">
                            <FormField<ScreenerCreate>
                                control={methods.control}
                                fieldType="input"
                                name={`config.options.${index}.value`}
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <FormField<ScreenerCreate>
                                control={methods.control}
                                defaultValue={false}
                                fieldType="checkbox"
                                label={t('Passes')}
                                name={`config.options.${index}.passes`}
                            />
                        </div>
                        {optionIds.length > 2 && (
                            <Button
                                className="flex-shrink-0"
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
                {t('Add option')}
            </Button>
        </>
    );
};

export default SelectionFields;

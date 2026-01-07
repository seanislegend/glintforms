'use client';

import {FormField} from '@glint/form/fields';
import Label from '@glint/form/label';
import Switch from '@glint/form/switch';
import {BasicCard} from '@glint/ui/card';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {useFormContext, useWatch} from 'react-hook-form';
import {useI18n} from '@/hooks/use-i18n';
import {QUESTION_EXPORT_FIELDS} from '@/lib/schemas/constants';

const ExportQuestionsFieldSelector: React.FC = () => {
    const {t} = useI18n();
    const {control, setValue} = useFormContext();
    const includeAllFields = useWatch({name: 'includeAllFields'});
    const selectedFields = useWatch({name: 'fields'});

    const handleFieldToggle = (fieldKey: string) => {
        const newValue = selectedFields.includes(fieldKey)
            ? selectedFields.filter((f: string) => f !== fieldKey)
            : [...selectedFields, fieldKey];
        setValue('fields', newValue);
    };

    return (
        <ToggleVisibility visible={!includeAllFields}>
            <BasicCard
                title={t('Select fields to include')}
                description={t(
                    "Only fields that are selected will be included in the export. If you want to include all fields, enable the 'Include all fields' switch."
                )}
            >
                <div className="space-y-3">
                    {QUESTION_EXPORT_FIELDS.map(field => (
                        <FormField
                            key={field.key}
                            control={control}
                            fieldType="switch"
                            label={field.label}
                            name={field.key}
                            render={({field}) => {
                                const fieldText = QUESTION_EXPORT_FIELDS.find(
                                    f => f.key === field.name
                                );

                                return (
                                    <div key={field.name} className="flex space-x-2">
                                        <Switch
                                            id={field.name}
                                            checked={selectedFields.includes(field.name)}
                                            onCheckedChange={() => handleFieldToggle(field.name)}
                                        />
                                        <div className="flex-1">
                                            <Label
                                                className="text-sm font-medium"
                                                htmlFor={field.name}
                                            >
                                                {t(fieldText?.label || '')}
                                            </Label>
                                            {fieldText?.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {t(fieldText.description)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    ))}
                </div>
            </BasicCard>
        </ToggleVisibility>
    );
};

export default ExportQuestionsFieldSelector;

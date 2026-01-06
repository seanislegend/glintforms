'use client';

import {FormField} from '@glint/form/fields';
import Switch from '@glint/form/switch';
import {BasicCard} from '@glint/ui/card';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {t} from '@/lib/i18n';
import {useFormContext, useWatch} from 'react-hook-form';
import {ANSWER_EXPORT_FIELDS} from '@/lib/schemas/constants';

const ExportResponsesAnswerFieldSelector: React.FC = () => {
    const {control, setValue} = useFormContext();
    const includeAllAnswerFields = useWatch({name: 'includeAllAnswerFields'});
    const selectedAnswerFields = useWatch({name: 'answerFields'});

    const handleAnswerFieldToggle = (fieldKey: string) => {
        const newValue = selectedAnswerFields.includes(fieldKey)
            ? selectedAnswerFields.filter((f: string) => f !== fieldKey)
            : [...selectedAnswerFields, fieldKey];
        setValue('answerFields', newValue);
    };

    return (
        <ToggleVisibility visible={!includeAllAnswerFields}>
            <BasicCard
                title={t('Select answer fields to include')}
                description={t("Only answer fields that are selected will be included in the export. If you want to include all answer fields, enable the 'Include all answer fields' switch.")}
            >
                <div className="space-y-3 mt-4">
                    {ANSWER_EXPORT_FIELDS.map(field => (
                        <FormField
                            key={field.key}
                            control={control}
                            fieldType="switch"
                            label={field.label}
                            name={field.key}
                            render={({field}) => {
                                const fieldText = ANSWER_EXPORT_FIELDS.find(
                                    f => f.key === field.name
                                );

                                return (
                                    <div key={field.name} className="flex space-x-2">
                                        <Switch
                                            id={field.name}
                                            checked={selectedAnswerFields.includes(field.name)}
                                            onCheckedChange={() =>
                                                handleAnswerFieldToggle(field.name)
                                            }
                                        />
                                        <div className="flex-1 mt-[-1px]">
                                            <label
                                                className="text-sm font-medium"
                                                htmlFor={field.name}
                                            >
                                                {fieldText?.label}
                                            </label>
                                            {fieldText?.description && (
                                                <p className="text-xs text-muted-foreground">
                                                    {fieldText.description}
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

export default ExportResponsesAnswerFieldSelector;

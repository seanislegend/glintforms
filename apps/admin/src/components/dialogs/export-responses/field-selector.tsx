'use client';

import {FormField} from '@glint/form/fields';
import Switch from '@glint/form/switch';
import {BasicCard} from '@glint/ui/card';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {t} from '@/lib/i18n';
import {useFormContext, useWatch} from 'react-hook-form';
import {RESPONSE_EXPORT_FIELDS} from '@/lib/schemas/constants';

const ExportResponsesFieldSelector: React.FC = () => {
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
                description={t("Only fields that are selected will be included in the export. If you want to include all fields, enable the 'Include all fields' switch.")}
                title={t('Select fields to include')}
            >
                <div className="space-y-3">
                    {RESPONSE_EXPORT_FIELDS.map(field => (
                        <FormField
                            key={field.key}
                            control={control}
                            fieldType="switch"
                            label={field.label}
                            name={field.key}
                            render={({field}) => {
                                const fieldText = RESPONSE_EXPORT_FIELDS.find(
                                    f => f.key === field.name
                                );

                                return (
                                    <div key={field.name} className="flex space-x-2">
                                        <Switch
                                            id={field.name}
                                            checked={selectedFields.includes(field.name)}
                                            onCheckedChange={() => handleFieldToggle(field.name)}
                                        />
                                        <div className="flex-1 -mt-1">
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

export default ExportResponsesFieldSelector;

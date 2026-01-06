'use client';

import {FormField} from '@glint/form/fields';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@glint/ui/card';
import {t} from '@/lib/i18n';
import {type Control, useFormContext, useWatch} from 'react-hook-form';
import type {ScreenerCreate} from '@/lib/schemas/screeners';
import {COUNTRY_CODE_LABELS} from '@/utils/country-codes';
import SelectionFields from './form-selection-fields';

interface Props {
    defaultOptionIds?: Array<{id: string; tempId: string}>;
}

interface FieldProps {
    control: Control<ScreenerCreate>;
}

const ScreenerAgeFields: React.FC<FieldProps> = ({control}) => (
    <>
        <FormField<ScreenerCreate>
            control={control}
            defaultValue=""
            fieldProps={{min: '1', type: 'number'}}
            fieldType="input"
            label={t('Age')}
            name="config.value"
        />
        <FormField<ScreenerCreate>
            control={control}
            defaultValue=""
            fieldType="radio-group"
            label={t('Operator')}
            name="config.operator"
            options={[
                {label: t('Over'), value: 'over'},
                {label: t('Under'), value: 'under'}
            ]}
        />
    </>
);

const ScreenerLocationFields: React.FC<FieldProps> = ({control}) => {
    const countryOptions = Object.entries(COUNTRY_CODE_LABELS).map(([code, label]) => ({
        label,
        value: code
    }));

    return (
        <FormField<ScreenerCreate>
            control={control}
            defaultValue={[]}
            fieldProps={{multiple: true}}
            fieldType="combobox"
            label={t('Countries')}
            name="config.countries"
            options={countryOptions}
        />
    );
};

const screenerDescriptions: Record<string, string> = {
    age: t(
        'Only allow respondents to access the survey if they are older or younger than the specified age.'
    ),
    location: t(
        'Only allow respondents to access the survey if they are in the specified countries.'
    ),
    selection: t(
        'Only allow respondents to access the survey if they answer the question correctly.'
    )
};

const ScreenerTypeFields: React.FC<Props> = ({defaultOptionIds}) => {
    const methods = useFormContext<ScreenerCreate>();
    const screenerType = useWatch({control: methods.control, name: 'type'});

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('Screener configuration')}</CardTitle>
                <CardDescription>{screenerDescriptions[screenerType]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {screenerType === 'age' && <ScreenerAgeFields control={methods.control} />}
                {screenerType === 'location' && (
                    <ScreenerLocationFields control={methods.control} />
                )}
                {screenerType === 'selection' && (
                    <SelectionFields defaultOptionIds={defaultOptionIds} />
                )}
            </CardContent>
        </Card>
    );
};

export default ScreenerTypeFields;

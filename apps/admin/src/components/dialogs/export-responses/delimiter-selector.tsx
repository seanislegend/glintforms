'use client';

import {FormField} from '@glint/form/fields';
import {BasicCard} from '@glint/ui/card';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {t} from '@/lib/i18n';
import {useFormContext, useWatch} from 'react-hook-form';

const ExportResponsesDelimiterSelector: React.FC = () => {
    const {control} = useFormContext();
    const useCustomDelimiter = useWatch({name: 'useCustomDelimiter'});

    return (
        <ToggleVisibility visible={useCustomDelimiter}>
            <BasicCard>
                <FormField
                    control={control}
                    description={t('Choose a custom delimiter for multiple choice answers, e.g. pipe (|), comma (,) or semicolon (;). If you want to use a space, be sure to include it in the delimiter.')}
                    fieldType="input"
                    label={t('Delimiter')}
                    name="codedAnswerDelimiter"
                />
            </BasicCard>
        </ToggleVisibility>
    );
};

export default ExportResponsesDelimiterSelector;

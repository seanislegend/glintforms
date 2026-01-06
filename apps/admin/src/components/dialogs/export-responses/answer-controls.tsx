'use client';

import {FormField} from '@glint/form/fields';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {useI18n} from '@/hooks/use-i18n';
import {useFormContext, useWatch} from 'react-hook-form';
import AnswerFieldSelector from './answer-field-selector';
import DelimiterSelector from './delimiter-selector';

const ExportResponsesAnswerControls: React.FC = () => {
    const {t} = useI18n();
    const {control} = useFormContext();
    const includeAnswers = useWatch({name: 'includeAnswers'});

    return (
        <ToggleVisibility visible={includeAnswers}>
            <div className="grid gap-3">
                <FormField
                    control={control}
                    description={t(
                        'Answer fields will include question names, values, and metadata.'
                    )}
                    fieldType="switch"
                    label={t('Include all answer fields')}
                    name="includeAllAnswerFields"
                />
                <AnswerFieldSelector />
                <FormField
                    control={control}
                    description={t('Use a custom delimiter for multiple choice answers.')}
                    fieldType="switch"
                    label={t('Use custom delimiter for coded answers')}
                    name="useCustomDelimiter"
                />
                <DelimiterSelector />
            </div>
        </ToggleVisibility>
    );
};

export default ExportResponsesAnswerControls;

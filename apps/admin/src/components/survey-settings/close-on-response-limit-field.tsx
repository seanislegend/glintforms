import {FormField} from '@glint/form/fields';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {useI18n} from '@/hooks/use-i18n';
import {useFormContext, useWatch} from 'react-hook-form';

const SurveySecuritySettingsPasswordField: React.FC = () => {
    const {t} = useI18n();
    const {control} = useFormContext();
    const willCloseOnResponseLimit = useWatch({name: 'closeOnResponseLimit'});

    return (
        <>
            <FormField
                control={control}
                description={t('When the response limit is reached, the survey will be closed.')}
                fieldType="switch"
                label={t('Close on response limit')}
                name="closeOnResponseLimit"
            />
            <ToggleVisibility visible={willCloseOnResponseLimit}>
                <FormField
                    control={control}
                    description={t(
                        'The text that will be displayed when the response limit is reached.'
                    )}
                    fieldType="input"
                    label={t('Closed text')}
                    name="closedText"
                />
            </ToggleVisibility>
        </>
    );
};

export default SurveySecuritySettingsPasswordField;

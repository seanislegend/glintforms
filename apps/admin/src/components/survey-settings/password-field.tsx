import {FormField} from '@glint/form/fields';
import Button from '@glint/ui/button';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {t} from '@/lib/i18n';
import {useFormContext, useWatch} from 'react-hook-form';

const SurveySecuritySettingsPasswordField: React.FC = () => {
    const {control, setValue} = useFormContext();
    const isPasswordProtected = useWatch({name: 'isPasswordProtected'});
    const hasPassword = useWatch({name: 'hasPassword'});
    const changePassword = useWatch({name: 'changePassword'});

    const handleCancelPasswordChange = () => {
        setValue('changePassword', false);
        setValue('password', '');
    };

    return (
        <ToggleVisibility visible={isPasswordProtected}>
            {hasPassword ? (
                <>
                    <ToggleVisibility visible={!changePassword}>
                        <Button variant="outline" onClick={() => setValue('changePassword', true)}>
                            {t('Change current password')}
                        </Button>
                    </ToggleVisibility>
                    <ToggleVisibility visible={changePassword}>
                        <div className="space-y-2">
                            <FormField
                                control={control}
                                description={t(
                                    'Enter the new password that will be required to access the survey.'
                                )}
                                fieldType="password-input"
                                name="password"
                                label=""
                            />
                            <Button variant="outline" onClick={handleCancelPasswordChange}>
                                {t('Cancel')}
                            </Button>
                        </div>
                    </ToggleVisibility>
                </>
            ) : (
                <FormField
                    control={control}
                    description={t(
                        'Enter the password that will be required to access the survey. This will be securely stored.'
                    )}
                    fieldType="password-input"
                    name="password"
                    label=""
                />
            )}
        </ToggleVisibility>
    );
};

export default SurveySecuritySettingsPasswordField;

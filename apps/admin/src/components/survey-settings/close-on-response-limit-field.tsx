import {FormField} from '@glint/form/fields';
import ToggleVisibility from '@glint/ui/toggle-visibility';
import {useFormContext, useWatch} from 'react-hook-form';

const SurveySecuritySettingsPasswordField: React.FC = () => {
    const {control} = useFormContext();
    const willCloseOnResponseLimit = useWatch({name: 'closeOnResponseLimit'});

    return (
        <>
            <FormField
                control={control}
                description="When the response limit is reached, the survey will be closed."
                fieldType="switch"
                label="Close on response limit"
                name="closeOnResponseLimit"
            />
            <ToggleVisibility visible={willCloseOnResponseLimit}>
                <FormField
                    control={control}
                    description="The text that will be displayed when the response limit is reached."
                    fieldType="input"
                    label="Closed text"
                    name="closedText"
                />
            </ToggleVisibility>
        </>
    );
};

export default SurveySecuritySettingsPasswordField;

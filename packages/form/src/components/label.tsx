import {Field as BaseField} from '@base-ui-components/react/field';
import {cn} from '../lib/utils';

export const LABEL_CLASSNAME =
    'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50';

const Label: React.FC<React.ComponentProps<typeof BaseField.Label>> = ({className, ...props}) => {
    return (
        <BaseField.Label data-slot="label" className={cn(LABEL_CLASSNAME, className)} {...props} />
    );
};

export default Label;

import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {cn} from '../lib/utils';
import Condition from './condition';

interface Props {
    className?: string;
    hasWrapper?: boolean;
    size?: keyof typeof SPINNER_SIZE;
}

const SPINNER_SIZE = {
    sm: 'size-4',
    md: 'size-6',
    lg: 'size-8',
    xl: 'size-10'
} as const;

const Spinner: React.FC<Props> = ({className, hasWrapper = false, size = 'md'}) => {
    return (
        <Condition
            condition={hasWrapper}
            wrapper={children => <div className="flex items-center justify-center">{children}</div>}
        >
            <SpinnerGapIcon
                className={cn(SPINNER_SIZE[size], 'animate-spin', className)}
                weight="bold"
            />
        </Condition>
    );
};

export default Spinner;

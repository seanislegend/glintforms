import {cn} from '../lib/utils';

interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16'
};

const Spacer: React.FC<React.PropsWithChildren<Props>> = ({size = 'md', children}) => (
    <div className={cn(sizes[size])}>{children}</div>
);

export default Spacer;

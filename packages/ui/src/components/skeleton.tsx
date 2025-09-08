import {cn} from '../lib/utils';

const Skeleton: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div data-slot="skeleton" className={cn('bg-accent animate-pulse', className)} {...props} />
    );
};

export {Skeleton};

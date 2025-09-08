import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

const alertVariants = cva(
    'rounded relative w-full border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive:
                    'text-destructive border-red-200 bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive',
                success:
                    'text-green-800 border-green-200 bg-green-50 [&>svg]:text-current *:data-[slot=alert-description]:text-green-700',
                warning:
                    'text-yellow-800 border-yellow-200 bg-yellow-50 [&>svg]:text-current *:data-[slot=alert-description]:text-yellow-700'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

const Alert: React.FC<React.ComponentProps<'div'> & VariantProps<typeof alertVariants>> = ({
    className,
    variant,
    ...props
}) => {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({variant}), className)}
            {...props}
        />
    );
};

const AlertTitle: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="alert-title"
            className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
            {...props}
        />
    );
};

const AlertDescription: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
                className
            )}
            {...props}
        />
    );
};

export {Alert, AlertTitle, AlertDescription};

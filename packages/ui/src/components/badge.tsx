import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

const badgeVariants = cva(
    'inline-flex items-center leading-none justify-center rounded-sm border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden px-2 py-1.5 font-mono uppercase tracking-wide',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
                destructive:
                    'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
                stale: 'bg-gray-50 text-gray-600 border-gray-100',
                success: 'bg-green-50 text-green-600 border-green-100',
                error: 'bg-red-50 text-red-600 border-red-100',
                warning: 'bg-orange-50 text-orange-600 border-orange-100',
                info: 'bg-blue-50 text-blue-600 border-blue-100'
            },
            size: {
                default: 'text-[11px] !leading-none',
                sm: 'text-[11px] !leading-none',
                md: 'text-[11px] !leading-none',
                lg: 'text-[11px] !leading-none'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

const Badge: React.FC<React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>> = ({
    className,
    size,
    variant,
    ...props
}) => {
    return (
        <span
            data-slot="badge"
            className={cn(badgeVariants({variant, size}), className)}
            {...props}
        />
    );
};

export {Badge, badgeVariants};

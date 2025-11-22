import {mergeProps} from '@base-ui-components/react/merge-props';
import {useRender} from '@base-ui-components/react/use-render';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

export const buttonVariants = cva(
    "inline-flex rounded items-center duration-200 justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive has-[href]:hover:underline border active:scale-[0.98] active:duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[active='true']:bg-accent",
    {
        variants: {
            variant: {
                default:
                    'bg-primary border-primary text-primary-foreground shadow-xs hover:bg-primary/90',
                destructive:
                    'bg-destructive border-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:text-white',
                outline:
                    'bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
                secondary:
                    'bg-secondary border-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
                accent: 'bg-accent border-accent text-accent-foreground shadow-xs hover:bg-accent/90',
                ghost: 'hover:bg-accent border-transparent hover:text-accent-foreground dark:hover:bg-accent/50',
                destructiveGhost:
                    'hover:bg-destructive/10 border-transparent hover:text-destructive text-destructive shadow-xs',
                link: 'text-primary underline-offset-2 underline hover:decoration-2'
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 px-6 has-[>svg]:px-4',
                icon: 'size-8 p-1'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

const defaultButtonRender = () => <button type="button" />;

const Button: React.FC<
    useRender.ComponentProps<'button'> &
        VariantProps<typeof buttonVariants> & {
            pending?: boolean;
        }
> = ({
    className,
    pending = false,
    render = defaultButtonRender,
    size,
    type = 'button',
    variant,
    ...props
}) => {
    return useRender({
        render,
        props: mergeProps<'button'>(
            {
                className: cn(buttonVariants({variant, size}), className),
                // @ts-ignore - todo: https://github.com/mui/base-ui/issues/2370
                'data-slot': 'button',
                disabled: pending || props.disabled,
                type
            },
            props,
            {
                children: (
                    <>
                        {props.children}
                        {pending && <SpinnerGapIcon className="size-5 animate-spin" />}
                    </>
                )
            }
        )
    });
};

export default Button;

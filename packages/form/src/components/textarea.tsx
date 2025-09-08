import {cn} from '../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    ref?: React.Ref<HTMLTextAreaElement>;
}

const Textarea = ({className, ref, ...props}: TextareaProps) => {
    return (
        <textarea
            className={cn(
                'rounded flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 transition-[color,box-shadow]',
                className
            )}
            ref={ref}
            {...props}
        />
    );
};

export default Textarea;

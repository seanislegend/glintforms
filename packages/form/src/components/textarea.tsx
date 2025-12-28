import {cn} from '../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    ref?: React.Ref<HTMLTextAreaElement>;
}

const Textarea = ({className, ref, ...props}: TextareaProps) => {
    return (
        <textarea
            className={cn(
                'rounded flex w-full border shadow-xs border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-input-border-muted focus-visible:border-input-border-accent focus-visible:ring-offset-1 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 transition-[color,box-shadow]',
                className
            )}
            ref={ref}
            {...props}
        />
    );
};

export default Textarea;

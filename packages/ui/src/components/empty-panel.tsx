import {cn} from '@glint/ui/utils';
import {Heading3} from './heading';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    Icon?: React.ComponentType<{className?: string}>;
    text?: string;
    title?: string;
    children?: React.ReactNode;
}

const EmptyPanel: React.FC<Props> = ({children, text, Icon, title, ...props}) => {
    return (
        <div {...props} className={cn('@container/empty-panel', props.className)}>
            <div className="rounded animate-in fade-in flex flex-col h-full bg-accent/20 border border-dashed border-accent-foreground/20 @xs/empty-panel:items-center @xs/empty-panel:justify-center @xs/empty-panel:min-h-32 p-8">
                {(title || Icon) && (
                    <div className="flex items-center text-muted-foreground gap-2 mb-2">
                        {Icon && <Icon className="flex-shrink-0 size-5" />}
                        {title && <Heading3>{title}</Heading3>}
                    </div>
                )}
                <div className="max-w-md @xs/empty-panel:max-w-lg @xs/empty-panel:text-center space-y-4">
                    {text && <p className="text-sm text-muted-foreground text-pretty">{text}</p>}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default EmptyPanel;

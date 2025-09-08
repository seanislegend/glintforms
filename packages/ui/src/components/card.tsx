import {cn} from '../lib/utils';

const Card: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="card"
            className={cn(
                'bg-card rounded text-card-foreground flex flex-col gap-6 py-6 relative',
                className
            )}
            {...props}
        />
    );
};

const CardHeader: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="card-header"
            className={cn(
                '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
                className
            )}
            {...props}
        />
    );
};

const CardTitle: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="card-title"
            className={cn('leading-none font-medium', className)}
            {...props}
        />
    );
};

const CardDescription: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="card-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
};

const CardAction: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="card-action"
            className={cn(
                'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
                className
            )}
            {...props}
        />
    );
};

const CardContent: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
};

const CardFooter: React.FC<React.ComponentProps<'div'>> = ({className, ...props}) => {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
            {...props}
        />
    );
};

const BasicCard: React.FC<React.ComponentProps<'div'> & {description?: string; title?: string}> = ({
    children,
    className,
    description,
    title,
    ...props
}) => {
    return (
        <Card {...props}>
            {(title || description) && (
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
        </Card>
    );
};

export {
    BasicCard,
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent
};

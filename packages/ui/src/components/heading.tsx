import {cn} from '@glint/ui/utils';

export const Heading1: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className,
    ...props
}) => (
    <h1 className={cn('text-3xl xl:text-4xl tracking-tight font-semibold', className)} {...props}>
        {children}
    </h1>
);

export const Heading2: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className,
    ...props
}) => (
    <h2 className={cn('text-xl xl:text-2xl tracking-tight font-semibold', className)} {...props}>
        {children}
    </h2>
);

export const Heading3: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className,
    ...props
}) => (
    <h3 className={cn('text-lg tracking-tight font-medium', className)} {...props}>
        {children}
    </h3>
);

export const Heading4: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className,
    ...props
}) => (
    <h4 className={cn('text-base tracking-tight font-medium', className)} {...props}>
        {children}
    </h4>
);

export const Heading5: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
    children,
    className,
    ...props
}) => (
    <h5 className={cn('text-sm tracking-tight font-medium leading-tighter', className)} {...props}>
        {children}
    </h5>
);

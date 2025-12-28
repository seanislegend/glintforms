import {useRender} from '@base-ui-components/react/use-render';
import {ArrowsHorizontalIcon} from '@phosphor-icons/react/dist/ssr/ArrowsHorizontal';
import {CaretRightIcon} from '@phosphor-icons/react/dist/ssr/CaretRight';
import {cn} from '../lib/utils';

const Breadcrumb: React.FC<React.ComponentProps<'nav'>> = ({...props}) => {
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
};

const BreadcrumbList: React.FC<React.ComponentProps<'ol'>> = ({className, ...props}) => {
    return (
        <ol
            data-slot="breadcrumb-list"
            className={cn(
                'text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5',
                className
            )}
            {...props}
        />
    );
};

const BreadcrumbItem: React.FC<React.ComponentProps<'li'>> = ({className, ...props}) => {
    return (
        <li
            data-slot="breadcrumb-item"
            className={cn('inline-flex items-center gap-1.5', className)}
            {...props}
        />
    );
};

const BreadcrumbLink: React.FC<useRender.ComponentProps<'a'>> = ({
    // biome-ignore lint/a11y/useAnchorContent: base ui
    render = <a />,
    className,
    ...props
}) => {
    return useRender({
        render,
        props: {
            // @ts-expect-error - todo: https://github.com/mui/base-ui/issues/2370
            'data-slot': 'breadcrumb-link',
            className: cn(
                'hover:text-foreground transition-colors hover:underline underline-offset-2',
                className
            ),
            ...props
        }
    });
};

const BreadcrumbPage: React.FC<React.ComponentProps<'span'>> = ({className, ...props}) => {
    return (
        <span
            aria-current="page"
            aria-disabled="true"
            className={cn('text-foreground font-normal', className)}
            data-slot="breadcrumb-page"
            {...props}
        />
    );
};

const BreadcrumbSeparator: React.FC<React.ComponentProps<'li'>> = ({
    children,
    className,
    ...props
}) => {
    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn('[&>svg]:size-3.5', className)}
            {...props}
        >
            {children ?? <CaretRightIcon />}
        </li>
    );
};

const BreadcrumbEllipsis: React.FC<React.ComponentProps<'span'>> = ({className, ...props}) => {
    return (
        <span
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            aria-hidden="true"
            className={cn('flex size-9 items-center justify-center', className)}
            {...props}
        >
            <ArrowsHorizontalIcon className="size-4" />
            <span className="sr-only">More</span>
        </span>
    );
};

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis
};

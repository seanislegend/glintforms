import {ArrowLeftIcon} from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import Condition from './condition';
import {Heading2} from './heading';
import Link from './link';

interface Props {
    actions?: React.ReactNode;
    backAction?: {
        href: string;
        text: string;
    };
    text?: string;
    title?: string;
}

const SectionHeader: React.FC<React.PropsWithChildren<Props>> = ({
    actions,
    backAction,
    text,
    title,
    children
}) => (
    <Condition
        condition={!!actions}
        wrapper={children => (
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:gap-8 xl:justify-between">
                {children}
                <div className="flex items-center flex-wrap gap-2 animate-in fade-in duration-200">
                    {actions}
                </div>
            </div>
        )}
    >
        <div className="flex flex-col space-y-2">
            {backAction && (
                <div>
                    <Link
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2 hover:text-foreground hover:underline transition-colors duration-200"
                        href={backAction.href}
                    >
                        <ArrowLeftIcon className="size-4" />
                        {backAction.text}
                    </Link>
                </div>
            )}
            {title && <Heading2>{title}</Heading2>}
            {text && <p className="text-muted-foreground">{text}</p>}
            {children}
        </div>
    </Condition>
);

export default SectionHeader;

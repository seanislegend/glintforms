import Link, {type LinkProps} from 'next/link';
import {cn} from '../lib/utils';

interface Props extends React.PropsWithChildren<LinkProps> {
    className?: string;
    href: string;
}

const TextLink: React.FC<Props> = ({children, className = '', href, ...props}) => {
    return (
        <Link
            href={href}
            {...props}
            className={cn('text-link underline-offset-2 underline hover:decoration-2', className)}
        >
            {children}
        </Link>
    );
};

export default TextLink;

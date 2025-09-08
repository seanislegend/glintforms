'use client';

import Button from '@glint/ui/button';
import Condition from '@glint/ui/condition';
import TextLink from '@glint/ui/text-link';
import {CheckIcon} from '@phosphor-icons/react/dist/ssr/Check';
import {CopyIcon} from '@phosphor-icons/react/dist/ssr/Copy';
import {useState} from 'react';

interface Props {
    href?: string;
    id: string;
}

const RecordId: React.FC<Props> = ({href, id}) => {
    const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

    const handleCopy = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navigator.clipboard.writeText(id);
        setCopyState('copied');
        setTimeout(() => {
            setCopyState('idle');
        }, 2000);
    };

    return (
        <div className="inline-flex items-center gap-x-1 group rounded relative bg-muted px-2 py-1 h-8 flex-shrink-0 whitespace-nowrap">
            <span className="w-20 xl:w-28 inline-block overflow-hidden text-ellipsis group-hover:pr-6">
                <Condition
                    condition={!!href}
                    // biome-ignore lint/style/noNonNullAssertion: fix types
                    wrapper={children => <TextLink href={href!}>{children}</TextLink>}
                >
                    {id}
                </Condition>
            </span>
            <Button
                className="transition-all duration-200 ease-in-out absolute right-1 top-1 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 h-6 w-6"
                onClick={handleCopy}
                size="icon"
                type="button"
                variant="outline"
            >
                <CopyIcon
                    className={`size-4 transition-all duration-200 ease-in-out ${
                        copyState === 'copied' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                    }`}
                />
                <CheckIcon
                    className={`size-4 absolute transition-all duration-200 ease-in-out ${
                        copyState === 'copied' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                />
            </Button>
        </div>
    );
};

export default RecordId;

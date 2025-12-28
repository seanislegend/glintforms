'use client';

import {cn} from '@glint/ui/utils';
import {useAtomValue} from 'jotai';
import {useEffect, useState} from 'react';
import {highlightsAtom} from '@/lib/store';

interface Props {
    id: string;
}

const HighlightChange: React.FC<React.PropsWithChildren<Props>> = ({children, id}) => {
    const highlights = useAtomValue(highlightsAtom);
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        const highlightCount = highlights[id];
        if (highlightCount && highlightCount > 0) {
            setIsHighlighted(true);
            const timer = setTimeout(() => {
                setIsHighlighted(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [highlights, id]);

    return (
        <div
            className={cn(
                'transition-all duration-300 ease-in-out',
                isHighlighted && 'bg-yellow-50 dark:bg-yellow-900/20'
            )}
        >
            {children}
        </div>
    );
};

export default HighlightChange;

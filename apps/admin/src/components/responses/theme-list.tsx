'use client';

import Button from '@glint/ui/button';
import {CaretDownIcon} from '@phosphor-icons/react/dist/ssr/CaretDown';
import {useState} from 'react';

interface Props {
    themes: QuestionTheme[];
}

const DEFAULT_MAX_THEMES = 8;

const ResponsesThemeList: React.FC<Props> = ({themes}) => {
    const [showAll, setShowAll] = useState(false);
    const displayedThemes = showAll ? themes : themes.slice(0, DEFAULT_MAX_THEMES);

    return (
        <div className="space-y-3">
            <ul className="list-disc list-outside pl-4 sm:text-sm space-y-1 text-black">
                {displayedThemes.map(theme => (
                    <li key={theme.id}>
                        <span className="flex flex-row gap-x-4 gap-y-2 items-center">
                            <span className="flex-grow">{theme.name}</span>
                        </span>
                    </li>
                ))}
            </ul>
            {!showAll && themes.length > DEFAULT_MAX_THEMES && (
                <Button onClick={() => setShowAll(true)} size="sm" variant="secondary">
                    <span>Show {themes.length - DEFAULT_MAX_THEMES} more</span>
                    <CaretDownIcon className="size-4" />
                </Button>
            )}
        </div>
    );
};

export default ResponsesThemeList;

import {Badge} from '@glint/ui/badge';
import {CheckSquareIcon} from '@phosphor-icons/react/dist/ssr/CheckSquare';
import {FileIcon} from '@phosphor-icons/react/dist/ssr/File';
import {HashIcon} from '@phosphor-icons/react/dist/ssr/Hash';
import {ListChecksIcon} from '@phosphor-icons/react/dist/ssr/ListChecks';
import {TextAaIcon} from '@phosphor-icons/react/dist/ssr/TextAa';
import type {QuestionType} from '@/lib/schemas/questions';

interface Props {
    size?: 'md' | 'sm';
    type: QuestionType;
}

const TYPE_ICONS = {
    text: TextAaIcon,
    number: HashIcon,
    single_select: CheckSquareIcon,
    multi_select: ListChecksIcon
} as const;
const ICON_SIZE_MAP = {
    md: '!size-5',
    sm: '!size-4'
} as const;
const TEXT_SIZE_MAP = {
    md: 'text-[15px]',
    sm: 'text-[13px]'
} as const;

const QuestionTypeBadge: React.FC<Props> = ({size = 'md', type}) => {
    const TypeIcon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] || FileIcon;
    const iconSize = ICON_SIZE_MAP[size];
    const textSize = TEXT_SIZE_MAP[size];

    return (
        <Badge className={textSize} variant="outline">
            <TypeIcon className={iconSize} />
            {type}
        </Badge>
    );
};

export default QuestionTypeBadge;

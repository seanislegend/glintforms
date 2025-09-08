import {Badge} from '@glint/ui/badge';
import {CheckSquareIcon} from '@phosphor-icons/react/dist/ssr/CheckSquare';
import {HashIcon} from '@phosphor-icons/react/dist/ssr/Hash';
import {ListChecksIcon} from '@phosphor-icons/react/dist/ssr/ListChecks';
import {TextAaIcon} from '@phosphor-icons/react/dist/ssr/TextAa';

const TYPE_ICONS = {
    text: TextAaIcon,
    number: HashIcon,
    single_select: CheckSquareIcon,
    multi_select: ListChecksIcon
} as const;

const QuestionTypeBadge: React.FC<React.PropsWithChildren<{type: string}>> = ({type}) => {
    const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS];

    return (
        <Badge variant="stale">
            <Icon className="!size-4 flex-shrink-0" />
            {type.replace('_', ' ')}
        </Badge>
    );
};

export default QuestionTypeBadge;

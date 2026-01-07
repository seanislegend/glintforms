import {Badge} from '@glint/ui/badge';
import {CheckSquareIcon} from '@phosphor-icons/react/dist/ssr/CheckSquare';
import {HashIcon} from '@phosphor-icons/react/dist/ssr/Hash';
import {ListChecksIcon} from '@phosphor-icons/react/dist/ssr/ListChecks';
import {TextAaIcon} from '@phosphor-icons/react/dist/ssr/TextAa';
import {useI18n} from '@/hooks/use-i18n';

const TYPE_ICONS = {
    text: TextAaIcon,
    number: HashIcon,
    single_select: CheckSquareIcon,
    multi_select: ListChecksIcon
} as const;

const QuestionTypeBadge: React.FC<React.PropsWithChildren<{type: string}>> = ({type}) => {
    const {t} = useI18n();
    const Icon = TYPE_ICONS[type as keyof typeof TYPE_ICONS];

    return (
        <Badge variant="stale">
            <Icon className="!size-4 flex-shrink-0" />
            {t(type).replace('_', ' ')}
        </Badge>
    );
};

export default QuestionTypeBadge;

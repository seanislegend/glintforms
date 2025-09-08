import {Card} from '@glint/ui/card';
import {cn} from '@glint/ui/utils';
import {CheckCircleIcon} from '@phosphor-icons/react/dist/ssr/CheckCircle';
import {ClockIcon} from '@phosphor-icons/react/dist/ssr/Clock';
import {FileTextIcon} from '@phosphor-icons/react/dist/ssr/FileText';
import {QuestionIcon} from '@phosphor-icons/react/dist/ssr/Question';
import {SealCheckIcon} from '@phosphor-icons/react/dist/ssr/SealCheck';
import {TrendUpIcon} from '@phosphor-icons/react/dist/ssr/TrendUp';
import {UsersIcon} from '@phosphor-icons/react/dist/ssr/Users';

interface Props {
    icon: keyof typeof STAT_CARD_ICON_THEMES;
    label?: string;
    theme?: keyof typeof STAT_CARD_THEMES;
    title: string;
    value?: string | number;
}

const STAT_CARD_ICON_THEMES = {
    authenticity: SealCheckIcon,
    completion: CheckCircleIcon,
    document: FileTextIcon,
    time: ClockIcon,
    trends: TrendUpIcon,
    unknown: QuestionIcon,
    users: UsersIcon
} as const;
const STAT_CARD_THEMES = {
    green: {
        icon: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/20'
    },
    blue: {
        icon: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    orange: {
        icon: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/20'
    },
    purple: {
        icon: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    red: {
        icon: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/20'
    },
    yellow: {
        icon: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/20'
    }
} as const;

const StatCard: React.FC<Props> = ({icon, label, theme = 'green', title, value}) => {
    const Icon = STAT_CARD_ICON_THEMES[icon as keyof typeof STAT_CARD_ICON_THEMES];

    return (
        <Card className="p-6">
            <div className="flex items-start justify-between gap-4 flex-grow">
                <div className="h-full flex flex-col">
                    <p className="text-sm font-medium text-muted-foreground capitalize flex-grow">
                        {title}
                    </p>
                    <div>
                        <p
                            className="text-3xl font-bold h-9 relative w-full animate-in fade-in duration-200"
                            key={value}
                        >
                            {value ?? (
                                <span className="w-8 bg-muted absolute top-0 left-0 rounded h-9 translate-y-1" />
                            )}
                        </p>
                        {label && (
                            <span className="text-xs font-medium text-muted-foreground">
                                {label}
                            </span>
                        )}
                    </div>
                </div>
                <div
                    className={cn(
                        'h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0',
                        STAT_CARD_THEMES[theme].bg
                    )}
                >
                    <Icon className={cn('size-6 xl:size-8', STAT_CARD_THEMES[theme].icon)} />
                </div>
            </div>
        </Card>
    );
};

export default StatCard;

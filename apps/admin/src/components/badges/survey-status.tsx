import {Badge} from '@glint/ui/badge';
import {cn} from '@glint/ui/utils';
import {t} from '@/lib/i18n';
import {ArchiveIcon} from '@phosphor-icons/react/dist/ssr/Archive';
import {ChecksIcon} from '@phosphor-icons/react/dist/ssr/Checks';
import {FileIcon} from '@phosphor-icons/react/dist/ssr/File';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {TestTubeIcon} from '@phosphor-icons/react/dist/ssr/TestTube';

interface Props extends Omit<React.ComponentProps<typeof Badge>, 'size'> {
    size?: 'md' | 'sm' | 'xs';
    status: keyof typeof STATUS_VARIANTS;
}

const STATUS_VARIANTS = {
    draft: 'stale',
    testing: 'warning',
    active: 'info',
    complete: 'success',
    archived: 'destructive'
} as const;
const STATUS_LABELS = {
    draft: t('Draft'),
    testing: t('Testing'),
    active: t('Active'),
    complete: t('Complete'),
    archived: t('Archived')
} as const;
const STATUS_ICONS = {
    draft: PencilIcon,
    testing: TestTubeIcon,
    active: SpinnerGapIcon,
    complete: ChecksIcon,
    archived: ArchiveIcon
} as const;
const ICON_SIZE_MAP = {
    md: '!size-5',
    sm: '!size-4',
    xs: '!size-4'
} as const;
const TEXT_SIZE_MAP = {
    md: 'text-[15px]',
    sm: 'text-[13px]',
    xs: 'text-[11px]'
} as const;

const SurveyStatusBadge: React.FC<Props> = ({size = 'md', status, ...props}) => {
    if (!Object.keys(STATUS_VARIANTS).includes(status)) {
        console.warn(
            `Invalid status: ${status}. Valid statuses are: ${Object.keys(STATUS_VARIANTS).join(', ')}`
        );
    }

    const variant = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || 'default';
    const statusLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
    const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || FileIcon;
    const iconSize = ICON_SIZE_MAP[size];
    const textSize = TEXT_SIZE_MAP[size];

    return (
        <Badge variant={variant} {...props} className={cn(textSize, props.className)}>
            <StatusIcon className={iconSize} />
            {statusLabel}
        </Badge>
    );
};

export default SurveyStatusBadge;

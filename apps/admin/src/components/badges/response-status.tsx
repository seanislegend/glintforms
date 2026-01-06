'use client';

import {Badge} from '@glint/ui/badge';
import {useI18n} from '@/hooks/use-i18n';
import {ChecksIcon} from '@phosphor-icons/react/dist/ssr/Checks';
import {FileIcon} from '@phosphor-icons/react/dist/ssr/File';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';

interface Props extends React.ComponentProps<typeof Badge> {
    size?: 'md' | 'sm';
    status: keyof typeof STATUS_VARIANTS;
}

const STATUS_VARIANTS = {
    completed: 'success',
    incomplete: 'warning'
} as const;

const STATUS_ICONS = {
    completed: ChecksIcon,
    incomplete: SpinnerGapIcon
} as const;

const ResponseStatusBadge: React.FC<Props> = ({size = 'md', status, ...props}) => {
    const {t} = useI18n();
    
    const STATUS_LABELS = {
        completed: t('Completed'),
        incomplete: t('Incomplete')
    } as const;
    if (!Object.keys(STATUS_VARIANTS).includes(status)) {
        console.warn(
            `Invalid status: ${status}. Valid statuses are: ${Object.keys(STATUS_VARIANTS).join(', ')}`
        );
    }

    const variant = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || 'default';
    const statusLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
    const StatusIcon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || FileIcon;

    return (
        <Badge variant={variant} {...props} className={props.className}>
            <StatusIcon className="size-5" />
            {statusLabel}
        </Badge>
    );
};

export default ResponseStatusBadge;

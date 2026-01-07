'use client';

import {Badge} from '@glint/ui/badge';
import {useI18n} from '@/hooks/use-i18n';

const STATUS_VARIANTS = {
    active: 'success',
    inactive: 'error'
} as const;

const CampaignStatusBadge = ({status}: {status: string}) => {
    const {t} = useI18n();
    const variant = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || 'default';
    
    const STATUS_LABELS: Record<string, string> = {
        active: t('Active'),
        inactive: t('Inactive')
    };
    
    const label = STATUS_LABELS[status.toLowerCase()] || status.toLowerCase();
    return <Badge variant={variant}>{label}</Badge>;
};

export default CampaignStatusBadge;

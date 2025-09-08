import {Badge} from '@glint/ui/badge';

const STATUS_VARIANTS = {
    active: 'success',
    inactive: 'error'
} as const;

const CampaignStatusBadge = ({status}: {status: string}) => {
    const variant = STATUS_VARIANTS[status as keyof typeof STATUS_VARIANTS] || 'default';
    return <Badge variant={variant}>{status.toLowerCase()}</Badge>;
};

export default CampaignStatusBadge;

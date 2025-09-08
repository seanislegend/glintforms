import {Badge} from '@glint/ui/badge';
import {AUTHENTICITY_THRESHOLD, AUTHENTICITY_THRESHOLD_MEDIUM} from '@/lib/schemas/constants';

const STATUS_VARIANTS = {
    high: 'success',
    medium: 'warning',
    low: 'error'
} as const;

interface Props {
    score: number;
}

const AuthenticityScoreBadge: React.FC<Props> = ({score}) => {
    const getScoreLabel = (score: number) => {
        if (score >= AUTHENTICITY_THRESHOLD) return 'high';
        if (score >= AUTHENTICITY_THRESHOLD_MEDIUM) return 'medium';
        return 'low';
    };

    const label = getScoreLabel(score);
    const variant = STATUS_VARIANTS[label as keyof typeof STATUS_VARIANTS];

    return (
        <Badge className="uppercase" variant={variant}>
            {score}%
        </Badge>
    );
};

export default AuthenticityScoreBadge;

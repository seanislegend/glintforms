import {Badge} from '@glint/ui/badge';

const SENTIMENT_VARIANTS = {
    positive: 'success',
    negative: 'error',
    neutral: 'stale'
} as const;

const SentimentBadge = ({sentiment}: {sentiment: string}) => {
    const variant = SENTIMENT_VARIANTS[sentiment as keyof typeof SENTIMENT_VARIANTS] || 'default';
    return <Badge variant={variant}>{sentiment.toLowerCase()}</Badge>;
};

export default SentimentBadge;

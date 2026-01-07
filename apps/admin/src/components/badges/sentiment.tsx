'use client';

import {Badge} from '@glint/ui/badge';
import {useI18n} from '@/hooks/use-i18n';

const SENTIMENT_VARIANTS = {
    positive: 'success',
    negative: 'error',
    neutral: 'stale'
} as const;

const SentimentBadge = ({sentiment}: {sentiment: string}) => {
    const {t} = useI18n();
    const variant = SENTIMENT_VARIANTS[sentiment as keyof typeof SENTIMENT_VARIANTS] || 'default';

    const SENTIMENT_LABELS: Record<string, string> = {
        positive: t('Positive'),
        negative: t('Negative'),
        neutral: t('Neutral')
    };

    const label = SENTIMENT_LABELS[sentiment.toLowerCase()] || sentiment.toLowerCase();
    return <Badge variant={variant}>{label}</Badge>;
};

export default SentimentBadge;

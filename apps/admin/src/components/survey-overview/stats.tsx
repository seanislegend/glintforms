'use client';

import {useSuspenseQuery} from '@tanstack/react-query';
import StatCard from '@/components/stat-card';
import {useI18n} from '@/hooks/use-i18n';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    surveyId: string;
}

interface CardProps {
    avgAuthenticityScore?: number;
    avgCompletionTimeMinutes?: string;
    completionRate?: string;
    failedScreenerAttempts?: number;
    totalResponses?: number;
}

export const SurveyResponsesStatsCards: React.FC<CardProps> = ({
    avgAuthenticityScore,
    avgCompletionTimeMinutes,
    completionRate,
    failedScreenerAttempts,
    totalResponses
}) => {
    const {t} = useI18n();
    const hasScreeners = !!(failedScreenerAttempts && failedScreenerAttempts > 0);

    return (
        <div className="flex gap-4 mb-8 animate-in fade-in duration-300 flex-wrap [&_>div]:flex-grow 2xl:[&_>div]:flex-1">
            {hasScreeners && (
                <StatCard
                    label={t('Total respondents who failed the screener')}
                    icon="screener"
                    theme="red"
                    title={t('Failed screener attempts')}
                    value={failedScreenerAttempts}
                />
            )}
            <StatCard
                label={
                    hasScreeners
                        ? t('Total respondents who passed the screener')
                        : t('Total responses')
                }
                icon="users"
                theme="blue"
                title={t('Total responses')}
                value={totalResponses}
            />
            <StatCard
                label={
                    hasScreeners
                        ? t('Percentage of screened respondents who completed the survey')
                        : t('Percentage of respondents who completed the survey')
                }
                icon="completion"
                theme="green"
                title={t('Completion rate')}
                value={completionRate}
            />
            <StatCard
                label={t('Average authenticity score of completed responses')}
                icon="authenticity"
                theme="orange"
                title={t('Avg. authenticity score')}
                value={avgAuthenticityScore ? `${avgAuthenticityScore}%` : undefined}
            />
            <StatCard
                label={t('Average completion time of completed responses')}
                icon="time"
                theme="yellow"
                title={t('Avg. completion time')}
                value={avgCompletionTimeMinutes}
            />
        </div>
    );
};

const SurveyResponsesStats: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data: stats} = useSuspenseQuery(trpc.responses.getStats.queryOptions(surveyId));

    return (
        <SurveyResponsesStatsCards
            avgAuthenticityScore={stats.avgAuthenticityScore}
            avgCompletionTimeMinutes={stats.avgCompletionTimeMinutes}
            completionRate={stats.completionRate}
            totalResponses={stats.totalResponses}
        />
    );
};

export default SurveyResponsesStats;

'use client';

import {useSuspenseQuery} from '@tanstack/react-query';
import StatCard from '@/components/stat-card';
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
    const hasScreeners = !!(failedScreenerAttempts && failedScreenerAttempts > 0);

    return (
        <div className="flex gap-4 mb-8 animate-in fade-in duration-300 flex-wrap [&_>div]:flex-grow 2xl:[&_>div]:flex-1">
            {hasScreeners && (
                <StatCard
                    label="Total respondents who failed the screener"
                    icon="screener"
                    theme="red"
                    title="Failed Screener Attempts"
                    value={failedScreenerAttempts}
                />
            )}
            <StatCard
                label={
                    hasScreeners ? 'Total respondents who passed the screener' : 'Total responses'
                }
                icon="users"
                theme="blue"
                title="Total Responses"
                value={totalResponses}
            />
            <StatCard
                label={
                    hasScreeners
                        ? 'Percentage of screened respondents who completed the survey'
                        : 'Percentage of respondents who completed the survey'
                }
                icon="completion"
                theme="green"
                title="Completion Rate"
                value={completionRate}
            />
            <StatCard
                label="Average authenticity score of completed responses"
                icon="authenticity"
                theme="orange"
                title="Avg. Authenticity Score"
                value={avgAuthenticityScore ? `${avgAuthenticityScore}%` : undefined}
            />
            <StatCard
                label="Average completion time of completed responses"
                icon="time"
                theme="yellow"
                title="Avg. Completion Time"
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

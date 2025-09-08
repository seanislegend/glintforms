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
    totalResponses?: number;
}

export const SurveyResponsesStatsCards: React.FC<CardProps> = ({
    avgAuthenticityScore,
    avgCompletionTimeMinutes,
    completionRate,
    totalResponses
}) => {
    return (
        <div className="grid grid-cols-1 @xl/main:grid-cols-2 @4xl/main:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-300">
            <StatCard icon="users" theme="blue" title="Total Responses" value={totalResponses} />
            <StatCard
                icon="completion"
                theme="green"
                title="Completion Rate"
                value={completionRate}
            />
            <StatCard
                icon="authenticity"
                theme="orange"
                title="Avg. Authenticity Score"
                value={avgAuthenticityScore ? `${avgAuthenticityScore}%` : undefined}
            />
            <StatCard
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

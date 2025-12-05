'use client';

import {Alert, AlertDescription} from '@glint/ui/alert';
import SectionHeader from '@glint/ui/section-header';
import {useQuery, useSuspenseQuery} from '@tanstack/react-query';
import {formatRelative} from 'date-fns/formatRelative';
import {SurveyResponsesStatsCards} from '@/components/survey-overview/stats';
import {surveyIsActive} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';
import GenderDistributionChart from './gender-distribution-chart';
import GeolocationDistributionChart from './geolocation-distribution-chart';
import ResponsesOverviewChart from './responses-overview';

interface Props {
    surveyId: string;
}

const SurveyInsights: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data: survey} = useSuspenseQuery(trpc.surveys.get.queryOptions(surveyId));
    const {data: stats} = useSuspenseQuery(trpc.responses.getStats.queryOptions(surveyId));
    const {data: insights} = useSuspenseQuery(trpc.responses.getInsights.queryOptions(surveyId));
    const {data: lastResponseTime} = useQuery({
        ...trpc.responses.getLastResponseTime.queryOptions(surveyId),
        enabled: !!(survey && surveyIsActive(survey.status))
    });

    return (
        <div className="space-y-6">
            <SectionHeader
                text="Comprehensive analytics and visualisations of responses to your survey."
                title="Survey Insights"
            />
            {survey && surveyIsActive(survey.status) && (
                <Alert variant="warning">
                    <AlertDescription>
                        This survey is active and responses are being collected. You can still view
                        the insights, but they may not be fully representative of the survey's final
                        state.{' '}
                        {lastResponseTime &&
                            `The last response was received ${formatRelative(
                                lastResponseTime,
                                new Date()
                            )}`}
                    </AlertDescription>
                </Alert>
            )}
            <SurveyResponsesStatsCards
                avgAuthenticityScore={stats.avgAuthenticityScore}
                avgCompletionTimeMinutes={stats.avgCompletionTimeMinutes}
                completionRate={stats.completionRate}
                totalResponses={stats.totalResponses}
            />
            <ResponsesOverviewChart
                dayData={insights.responsesByDay || []}
                timeData={insights.responsesByHour || []}
            />
            <div className="grid @2xl/main:grid-cols-2 gap-6">
                <GenderDistributionChart data={insights.genderDistribution || []} />
                <GeolocationDistributionChart data={insights.topGeolocations || []} />
            </div>
        </div>
    );
};

export default SurveyInsights;

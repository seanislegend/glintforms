'use client';

import {Alert, AlertDescription} from '@glint/ui/alert';
import SectionHeader from '@glint/ui/section-header';
import {useQuery, useSuspenseQuery} from '@tanstack/react-query';
import {formatRelative} from 'date-fns/formatRelative';
import {SurveyResponsesStatsCards} from '@/components/survey-overview/stats';
import {useI18n} from '@/hooks/use-i18n';
import {surveyIsActive} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';
import GenderDistributionChart from './gender-distribution-chart';
import GeolocationDistributionChart from './geolocation-distribution-chart';
import ResponsesOverviewChart from './responses-overview';
import ScreenerFailures from './screener-failures';

interface Props {
    surveyId: string;
}

const SurveyInsights: React.FC<Props> = ({surveyId}) => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const {data: survey} = useSuspenseQuery(trpc.surveys.get.queryOptions(surveyId));
    const {data: stats} = useSuspenseQuery(trpc.responses.getStats.queryOptions(surveyId));
    const {data: insights} = useSuspenseQuery(trpc.responses.getInsights.queryOptions(surveyId));
    const {data: lastResponseTime} = useQuery({
        ...trpc.responses.getLastResponseTime.queryOptions(surveyId),
        enabled: !!(survey && surveyIsActive(survey.status))
    });
    const {data: screenerStats} = useQuery({
        ...trpc.responses.getScreenerFailureStats.queryOptions(surveyId),
        enabled: true
    });
    const {data: surveyScreeners} = useQuery({
        ...trpc.surveys.getScreeners.queryOptions(surveyId),
        enabled: true
    });

    if (screenerStats && screenerStats.totalFailures > 0) {
        stats.failedScreenerAttempts = screenerStats.totalFailures;
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                text={t('Comprehensive analytics and visualisations of responses to your survey.')}
                title={t('Survey Insights')}
            />
            {survey && surveyIsActive(survey.status) && (
                <Alert variant="warning">
                    <AlertDescription>
                        {t(
                            "This survey is active and responses are being collected. You can still view the insights, but they may not be fully representative of the survey's final state."
                        )}{' '}
                        {lastResponseTime &&
                            `${t('The last response was received')} ${formatRelative(
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
                failedScreenerAttempts={stats.failedScreenerAttempts}
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
            <ScreenerFailures screenerStats={screenerStats} surveyScreeners={surveyScreeners} />
        </div>
    );
};

export default SurveyInsights;

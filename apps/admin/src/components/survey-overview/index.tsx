'use client';

import Spacer from '@glint/ui/spacer';
import Spinner from '@glint/ui/spinner';
import {useSuspenseQuery} from '@tanstack/react-query';
import {Suspense} from 'react';
import {surveyHasLaunched, surveyIsTesting} from '@/lib/surveys/status';
import {useTRPC} from '@/lib/trpc/react';
import SurveyOverviewHeader from './header';
import SurveyOverviewOutstandingActions from './outstanding-actions';
import SurveyOverviewRecentActivity from './recent-activity';
import SurveyResponsesStats from './stats';
import SurveyTestingOverview from './testing-overview';
import UnprocessedSubmissions from './unprocessed-submissions';

interface Props {
    surveyId: string;
}

const SurveyOverview: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data: survey} = useSuspenseQuery(trpc.surveys.get.queryOptions(surveyId));

    if (!survey) return <Spinner />;

    return (
        <div className="space-y-4">
            <div>
                <SurveyOverviewHeader survey={survey} />
                <Spacer size="md" />
            </div>
            {surveyHasLaunched(survey.status) && <SurveyResponsesStats surveyId={surveyId} />}
            {surveyIsTesting(survey.status) && <SurveyTestingOverview surveyId={surveyId} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Suspense fallback={<Spinner />}>
                        <SurveyOverviewRecentActivity surveyId={surveyId} />
                    </Suspense>
                </div>
                <div>
                    <Suspense fallback={<Spinner />}>
                        <UnprocessedSubmissions surveyId={surveyId} />
                    </Suspense>
                    <Suspense fallback={<Spinner />}>
                        <SurveyOverviewOutstandingActions surveyId={surveyId} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default SurveyOverview;

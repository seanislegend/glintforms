'use client';

import Spacer from '@glint/ui/spacer';
import Spinner from '@glint/ui/spinner';
import {useSuspenseQuery} from '@tanstack/react-query';
import SurveyResponsesStats from '@/components/survey-overview/stats';
import {surveyHasLaunched} from '@/lib/survey';
import {useTRPC} from '@/lib/trpc/react';
import SurveyOverviewHeader from './header';

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
        </div>
    );
};

export default SurveyOverview;

'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import Spinner from '@glint/ui/spinner';
import {useQuery} from '@tanstack/react-query';
import AuthenticityReasoning from '@/components/response-authenticity/reasoning';
import {useTRPC} from '@/lib/trpc/react';
import MissingAuthenticityScore from './missing';
import OverrideAuthenticityScore from './overide';
import OverridenAlert from './overriden-alert';
import ScoreBadge from './score-badge';

interface Props {
    responseId: string;
    surveyId: string;
}

const AuthenticityScoreOverview: React.FC<Props> = ({responseId, surveyId}) => {
    const trpc = useTRPC();
    const {data: score, isLoading} = useQuery(trpc.authenticity.get.queryOptions({responseId}));
    const {data: responseData} = useQuery(trpc.responses.get.queryOptions({responseId}));

    const metadata = score?.metadata as AuthenticityScoreMetadata;

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <CardTitle>Authenticity Score</CardTitle>
                {score?.id && (
                    <div>
                        <OverrideAuthenticityScore
                            defaultValues={{
                                originalScore: score.percentage ?? 0
                            }}
                            key={score.percentage.toString()}
                            lastUpdated={score.overrideTimestamp}
                            responseId={responseId}
                            scoreId={score.id}
                        />
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading && <Spinner />}
                {!isLoading && !score && (
                    <MissingAuthenticityScore
                        campaignId={responseData?.response?.campaignId}
                        responseId={responseId}
                        surveyId={surveyId}
                    />
                )}
                {!isLoading && score && (
                    <div className="animate-in fade-in duration-300 flex flex-row gap-4 lg:gap-16">
                        <div className="max-w-[120px] w-full h-full">
                            <ScoreBadge score={score.percentage} />
                        </div>
                        <div className="space-y-4">
                            {score.isOverridden && <OverridenAlert score={score} />}
                            <AuthenticityReasoning metadata={metadata} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AuthenticityScoreOverview;

import Container from '@glint/ui/container';
import SurveyInsights from '@/components/survey-insights';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';

interface Props {
    params: Promise<{surveyId: string}>;
}

const SurveyInsightsPage: React.FC<Props> = async ({params}) => {
    const {surveyId} = await params;
    prefetch(trpc.surveys.get.queryOptions(surveyId));
    prefetch(trpc.responses.getInsights.queryOptions(surveyId));
    prefetch(trpc.responses.getStats.queryOptions(surveyId));

    return (
        <HydrateClient>
            <Container>
                <SurveyInsights surveyId={surveyId} />
            </Container>
        </HydrateClient>
    );
};

export default SurveyInsightsPage;

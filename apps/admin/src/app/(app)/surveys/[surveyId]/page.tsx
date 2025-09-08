import Container from '@glint/ui/container';
import SurveyOverview from '@/components/survey-overview';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';

interface Props {
    params: Promise<{surveyId: string}>;
}

const SurveyDetailsPage: React.FC<React.PropsWithChildren<Props>> = async ({params}) => {
    const {surveyId} = await params;
    prefetch(trpc.surveys.get.queryOptions(surveyId));
    prefetch(trpc.responses.getStats.queryOptions(surveyId));

    return (
        <HydrateClient>
            <Container>
                <SurveyOverview surveyId={surveyId} />
            </Container>
        </HydrateClient>
    );
};

export default SurveyDetailsPage;

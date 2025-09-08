import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import Spinner from '@glint/ui/spinner';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import ResponseDetails from './response-details';

interface Props {
    params: Promise<{
        responseId: string;
        surveyId: string;
    }>;
}

const SurveyResponseDetailsPage: React.FC<React.PropsWithChildren<Props>> = async ({params}) => {
    const {responseId, surveyId} = await params;
    prefetch(trpc.responses.get.queryOptions({responseId}));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    backAction={{
                        text: 'All responses',
                        href: `/surveys/${surveyId}/responses`
                    }}
                    text="Detailed view of survey response and answers."
                    title="Response details"
                />
                <Spacer />
                <Suspense fallback={<Spinner />}>
                    <ResponseDetails responseId={responseId} surveyId={surveyId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default SurveyResponseDetailsPage;

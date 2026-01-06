import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import PageSpinner from '@/components/page-spinner';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import ResponsesList from './list';

interface Props {
    params: Promise<{surveyId: string}>;
}

const SurveyResponsesPage: React.FC<Props> = async ({params}) => {
    const {surveyId} = await params;
    prefetch(trpc.responses.getAll.queryOptions({surveyId, limit: 200, offset: 0}));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    text={t('View and manage all responses for this survey.')}
                    title={t('All responses')}
                />
                <Spacer size="md" />
                <Suspense fallback={<PageSpinner />}>
                    <ResponsesList surveyId={surveyId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default SurveyResponsesPage;

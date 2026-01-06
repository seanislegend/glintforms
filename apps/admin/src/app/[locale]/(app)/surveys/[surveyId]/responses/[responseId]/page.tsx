import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import Spinner from '@glint/ui/spinner';
import {Suspense} from 'react';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import ResponseDetails from './response-details';

interface Props {
    params: Promise<{
        locale: Locale;
        responseId: string;
        surveyId: string;
    }>;
}

const SurveyResponseDetailsPage: React.FC<React.PropsWithChildren<Props>> = async ({params}) => {
    const {locale, responseId, surveyId} = await params;
    prefetch(trpc.responses.get.queryOptions({responseId}));
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    backAction={{
                        text: t('All responses'),
                        href: `/surveys/${surveyId}/responses`
                    }}
                    text={t('Detailed view of survey response and answers.')}
                    title={t('Response details')}
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

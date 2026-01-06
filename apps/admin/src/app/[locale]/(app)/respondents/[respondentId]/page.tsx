import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import Spinner from '@glint/ui/spinner';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import RespondentDetails from './respondent-details';

interface PageProps {
    params: Promise<{respondentId: string}>;
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {respondentId} = await params;
    prefetch(trpc.respondents.getProfile.queryOptions(respondentId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    backAction={{
                        text: t('All respondents'),
                        href: '/respondents'
                    }}
                    text={t('View respondent details, surveys, and authenticity scores.')}
                    title={t('Respondent details')}
                />
                <Spacer size="md" />
                <Suspense fallback={<Spinner />}>
                    <RespondentDetails respondentId={respondentId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

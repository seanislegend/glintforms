import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import CohortDetails from '@/components/cohorts/cohort-details';
import AddRespondentsToCohortDialog from '@/components/dialogs/add-respondents-to-cohort';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CohortRespondents from './cohort-respondents';

interface Props {
    params: Promise<{cohortId: string}>;
}

const Page: React.FC<Props> = async ({params}) => {
    const {cohortId} = await params;
    prefetch(trpc.nav.getAll.queryOptions());
    prefetch(trpc.cohorts.get.queryOptions(cohortId));
    prefetch(trpc.cohorts.getRespondents.queryOptions(cohortId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('Cohort details')} />
                <Spacer size="md" />
                <Suspense>
                    <CohortDetails cohortId={cohortId} />
                </Suspense>
                <Spacer size="md" />
                <SectionHeader
                    actions={<AddRespondentsToCohortDialog cohortId={cohortId} />}
                    title={t('Respondents')}
                />
                <Spacer size="md" />
                <Suspense>
                    <CohortRespondents cohortId={cohortId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

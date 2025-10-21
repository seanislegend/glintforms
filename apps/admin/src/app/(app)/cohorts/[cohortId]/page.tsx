import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CohortDetails from './cohort-details';

interface Props {
    params: {
        cohortId: string;
    };
}

const Page: React.FC<Props> = async ({params}) => {
    prefetch(trpc.nav.getAll.queryOptions());
    prefetch(trpc.cohorts.get.queryOptions(params.cohortId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="Cohort details" />
                <Spacer size="md" />
                <Suspense>
                    <CohortDetails cohortId={params.cohortId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

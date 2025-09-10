import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CohortsList from './list';

const Page: React.FC = async () => {
    prefetch(trpc.cohorts.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="All cohorts" />
                <Spacer size="md" />
                <Suspense>
                    <CohortsList />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

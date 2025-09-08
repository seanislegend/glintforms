import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import RespondentsList from './list';

const Page: React.FC = async () => {
    prefetch(trpc.nav.getAll.queryOptions());
    prefetch(trpc.respondents.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="All respondents" />
                <Spacer size="md" />
                <Suspense>
                    <RespondentsList />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

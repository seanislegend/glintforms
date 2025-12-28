import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

const Page: React.FC = async () => {
    prefetch(trpc.screeners.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="Create new screener" />
                <Spacer size="md" />
                <Suspense>
                    <Form />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

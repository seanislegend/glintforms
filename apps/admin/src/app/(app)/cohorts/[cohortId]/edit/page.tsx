import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

interface PageProps {
    params: {
        cohortId: string;
    };
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {cohortId} = params;
    prefetch(trpc.cohorts.get.queryOptions(cohortId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="Edit cohort" />
                <Spacer size="md" />
                <Suspense>
                    <Form cohortId={cohortId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

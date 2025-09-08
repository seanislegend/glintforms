import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

interface PageProps {
    params: {
        respondentId: string;
    };
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {respondentId} = params;

    prefetch(trpc.respondents.get.queryOptions(respondentId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="Edit respondent" />
                <Spacer size="md" />
                <Suspense>
                    <Form respondentId={respondentId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

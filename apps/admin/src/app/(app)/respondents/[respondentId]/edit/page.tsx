import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import RespondentSummary from '@/components/respondents/summary';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

interface PageProps {
    params: Promise<{respondentId: string}>;
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {respondentId} = await params;
    prefetch(trpc.respondents.get.queryOptions(respondentId));

    return (
        <HydrateClient>
            <div className="grid md:grid-cols-12 relative min-h-full">
                <div className="md:col-span-8 md:border-r border-accent">
                    <Container>
                        <SectionHeader title="Edit respondent" />
                        <Spacer size="md" />
                        <Suspense>
                            <Form respondentId={respondentId} />
                        </Suspense>
                    </Container>
                </div>
                <div className="md:col-span-4">
                    <Suspense>
                        <RespondentSummary respondentId={respondentId} />
                    </Suspense>
                </div>
            </div>
        </HydrateClient>
    );
};

export default Page;

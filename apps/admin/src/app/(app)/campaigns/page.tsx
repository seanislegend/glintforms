import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CampaignsList from './list';

const Page: React.FC = async () => {
    prefetch(trpc.campaigns.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="All campaigns" />
                <Spacer size="md" />
                <Suspense>
                    <CampaignsList />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

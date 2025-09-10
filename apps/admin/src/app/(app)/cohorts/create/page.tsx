import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CohortForm from '../form';

const Page: React.FC = async () => {
    prefetch(trpc.surveys.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title="Create new cohort" />
                <Spacer size="md" />
                <CohortForm />
            </Container>
        </HydrateClient>
    );
};

export default Page;

import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import ClientOnly from '@/components/client-only';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

interface PageProps {
    params: Promise<{cohortId: string}>;
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {cohortId} = await params;
    prefetch(trpc.cohorts.get.queryOptions(cohortId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('Edit cohort')} />
                <Spacer size="md" />
                <ClientOnly>
                    <Form cohortId={cohortId} />
                </ClientOnly>
            </Container>
        </HydrateClient>
    );
};

export default Page;

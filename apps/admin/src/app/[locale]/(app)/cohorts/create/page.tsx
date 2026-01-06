import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CohortForm from '../form';

const Page: React.FC = async () => {
    prefetch(trpc.surveys.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('Create new cohort')} />
                <Spacer size="md" />
                <Suspense>
                    <CohortForm />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

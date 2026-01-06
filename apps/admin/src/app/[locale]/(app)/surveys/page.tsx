import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import SurveysList from './list';

const Page: React.FC = async () => {
    prefetch(trpc.surveys.getAll.queryOptions());

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('All surveys')} />
                <Spacer size="md" />
                <Suspense>
                    <SurveysList />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

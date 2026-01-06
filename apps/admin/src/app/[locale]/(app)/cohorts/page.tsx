import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import CohortsList from './list';

interface Props {
    params: Promise<{locale: Locale}>;
}

const Page: React.FC<Props> = async ({params}) => {
    const {locale} = await params;
    prefetch(trpc.cohorts.getAll.queryOptions());
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('All cohorts')} />
                <Spacer size="md" />
                <Suspense>
                    <CohortsList />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {t} from '@/lib/i18n';
import {Suspense} from 'react';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import ScreenerDetails from './screener-details';

interface Props {
    params: Promise<{screenerId: string}>;
}

const Page: React.FC<Props> = async ({params}) => {
    const {screenerId} = await params;
    prefetch(trpc.nav.getAll.queryOptions());
    prefetch(trpc.screeners.get.queryOptions(screenerId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('Screener details')} />
                <Spacer size="md" />
                <Suspense>
                    <ScreenerDetails screenerId={screenerId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;


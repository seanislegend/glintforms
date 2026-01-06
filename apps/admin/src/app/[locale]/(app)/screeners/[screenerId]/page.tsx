import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import ScreenerDetails from './screener-details';

interface Props {
    params: Promise<{locale: Locale; screenerId: string}>;
}

const Page: React.FC<Props> = async ({params}) => {
    const {locale, screenerId} = await params;
    prefetch(trpc.nav.getAll.queryOptions());
    prefetch(trpc.screeners.get.queryOptions(screenerId));
    const {t} = await getServerI18n(locale);

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

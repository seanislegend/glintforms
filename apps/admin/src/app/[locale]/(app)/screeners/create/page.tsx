import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

interface Props {
    params: Promise<{locale: Locale}>;
}

const Page: React.FC<Props> = async ({params}) => {
    const {locale} = await params;
    prefetch(trpc.screeners.getAll.queryOptions());
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <Container>
                <SectionHeader title={t('Create new screener')} />
                <Spacer size="md" />
                <Suspense>
                    <Form />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default Page;

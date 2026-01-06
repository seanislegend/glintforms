import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import ScreenerSummary from '@/components/screeners/summary';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import Form from './form';

interface PageProps {
    params: Promise<{locale: Locale; screenerId: string}>;
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {locale, screenerId} = await params;
    prefetch(trpc.screeners.get.queryOptions(screenerId));
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <div className="grid lg:grid-cols-12 relative min-h-full">
                <div className="lg:col-span-8 2xl:col-span-9 lg:border-r border-accent">
                    <Container>
                        <SectionHeader title={t('Edit screener')} />
                        <Spacer size="md" />
                        <Suspense>
                            <Form screenerId={screenerId} />
                        </Suspense>
                    </Container>
                </div>
                <div className="hidden lg:block lg:col-span-4 2xl:col-span-3">
                    <Suspense>
                        <ScreenerSummary screenerId={screenerId} />
                    </Suspense>
                </div>
            </div>
        </HydrateClient>
    );
};

export default Page;

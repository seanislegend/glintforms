import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import Form from '@/components/respondents/form';
import RespondentSummary from '@/components/respondents/summary';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';

interface PageProps {
    params: Promise<{locale: Locale; respondentId: string}>;
}

const Page: React.FC<PageProps> = async ({params}) => {
    const {locale, respondentId} = await params;
    prefetch(trpc.respondents.get.queryOptions(respondentId));
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <div className="grid md:grid-cols-12 relative min-h-full">
                <div className="md:col-span-8 md:border-r border-accent">
                    <Container>
                        <SectionHeader title={t('Edit respondent')} />
                        <Spacer size="md" />
                        <Suspense>
                            <Form respondentId={respondentId} />
                        </Suspense>
                    </Container>
                </div>
                <div className="md:col-span-4">
                    <Suspense>
                        <RespondentSummary respondentId={respondentId} />
                    </Suspense>
                </div>
            </div>
        </HydrateClient>
    );
};

export default Page;

import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import PageSpinner from '@/components/page-spinner';
import {getServerI18n} from '@/lib/i18n-server';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import SettingsClient from './client';

interface Props {
    params: Promise<{locale: Locale; surveyId: string}>;
}

const SettingsPage: React.FC<Props> = async ({params}) => {
    const {locale, surveyId} = await params;
    prefetch(trpc.surveys.get.queryOptions(surveyId));
    const {t} = await getServerI18n(locale);

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    text={t(
                        'Manage your survey settings, including access controls and publishing status.'
                    )}
                    title={t('Survey settings')}
                />
                <Spacer />
                <Suspense fallback={<PageSpinner />}>
                    <SettingsClient surveyId={surveyId} />
                </Suspense>
            </Container>
        </HydrateClient>
    );
};

export default SettingsPage;

import Container from '@glint/ui/container';
import SectionHeader from '@glint/ui/section-header';
import Spacer from '@glint/ui/spacer';
import {Suspense} from 'react';
import PageSpinner from '@/components/page-spinner';
import {HydrateClient, prefetch, trpc} from '@/lib/trpc/server';
import SettingsClient from './client';

interface Props {
    params: Promise<{surveyId: string}>;
}

const SettingsPage: React.FC<Props> = async ({params}) => {
    const {surveyId} = await params;
    prefetch(trpc.surveys.get.queryOptions(surveyId));

    return (
        <HydrateClient>
            <Container>
                <SectionHeader
                    text="Manage your survey settings, including access controls and publishing status."
                    title="Survey settings"
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

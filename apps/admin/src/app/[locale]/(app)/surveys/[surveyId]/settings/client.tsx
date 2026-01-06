'use client';

import {Tabs, TabsContent, TabsList, TabsTrigger} from '@glint/ui/tabs';
import {FileTextIcon} from '@phosphor-icons/react/dist/ssr/FileText';
import {LockKeyIcon} from '@phosphor-icons/react/dist/ssr/LockKey';
import {ShieldWarningIcon} from '@phosphor-icons/react/dist/ssr/ShieldWarning';
import {StepsIcon} from '@phosphor-icons/react/dist/ssr/Steps';
import {useSuspenseQuery} from '@tanstack/react-query';
import {redirect} from 'next/navigation';
import {toast} from 'sonner';
import PageSpinner from '@/components/page-spinner';
import SurveyAccessSettings from '@/components/survey-settings/access-settings';
import DetailsStep from '@/components/survey-settings/details';
import SurveyPublishingSettings from '@/components/survey-settings/publishing-settings';
import ScreenersSettings from '@/components/survey-settings/screeners';
import {useI18n} from '@/hooks/use-i18n';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    surveyId: string;
}

const SettingsPageClient: React.FC<Props> = ({surveyId}) => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const {data: survey, isLoading} = useSuspenseQuery(trpc.surveys.get.queryOptions(surveyId));

    if (isLoading) {
        return <PageSpinner />;
    } else if (!survey) {
        toast.error(t('Survey not found'), {id: 'error'});
        redirect(`/surveys`);
    }

    return (
        <Tabs className="w-full flex-col flex md:flex-row gap-4 md:gap-8" defaultValue="publishing">
            <TabsList className="flex flex-row md:flex-col justify-start gap-1 w-full md:w-40 h-fit shrink-0 [&_svg]:text-primary">
                <TabsTrigger className="md:w-full md:flex md:justify-start" value="publishing">
                    <StepsIcon />
                    {t('Publishing')}
                </TabsTrigger>
                <TabsTrigger className="md:w-full md:flex md:justify-start" value="access">
                    <LockKeyIcon />
                    {t('Access')}
                </TabsTrigger>
                <TabsTrigger className="md:w-full md:flex md:justify-start" value="screeners">
                    <ShieldWarningIcon />
                    {t('Screeners')}
                </TabsTrigger>
                <TabsTrigger className="md:w-full md:flex md:justify-start" value="details">
                    <FileTextIcon />
                    {t('Details')}
                </TabsTrigger>
            </TabsList>
            <div className="flex-grow">
                <TabsContent value="publishing">
                    <SurveyPublishingSettings survey={survey} />
                </TabsContent>
                <TabsContent value="access">
                    <SurveyAccessSettings survey={survey} />
                </TabsContent>
                <TabsContent value="screeners">
                    <ScreenersSettings survey={survey} />
                </TabsContent>
                <TabsContent value="details">
                    <DetailsStep survey={survey} />
                </TabsContent>
            </div>
        </Tabs>
    );
};

export default SettingsPageClient;

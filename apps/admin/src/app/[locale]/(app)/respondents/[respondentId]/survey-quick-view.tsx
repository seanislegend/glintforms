'use client';

import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import {Heading5} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import {Sheet, SheetDescription, SheetHeader, SheetPopup, SheetTitle} from '@glint/ui/sheet';
import TextLink from '@glint/ui/text-link';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useQueryState} from 'nuqs';
import {Suspense} from 'react';
import RecordId from '@/components/record-id';
import {useTRPC} from '@/lib/trpc/react';

const SurveyDetails = ({surveyId}: {surveyId: string}) => {
    const trpc = useTRPC();
    const {data: survey} = useSuspenseQuery(trpc.surveys.get.queryOptions(surveyId));

    if (!survey) {
        return (
            <EmptyPanel
                text="The survey you're looking for doesn't exist or has been removed."
                title="Survey not found"
            />
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Survey information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Heading5 className="text-muted-foreground">Title</Heading5>
                                <p className="text-sm">{survey.title}</p>
                            </div>
                            {survey.description && (
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        Description
                                    </Heading5>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {survey.description}
                                    </p>
                                </div>
                            )}
                            <div>
                                <Heading5 className="text-muted-foreground">ID</Heading5>
                                <div className="text-sm font-mono">
                                    <RecordId id={survey.id} />
                                </div>
                            </div>
                            {survey.campaign && (
                                <div>
                                    <Heading5 className="text-muted-foreground">Campaign</Heading5>
                                    <p className="text-sm">
                                        <TextLink href={`/campaigns/${survey.campaign.id}`}>
                                            {survey.campaign.title}
                                        </TextLink>
                                    </p>
                                </div>
                            )}
                            <div>
                                <Heading5 className="text-muted-foreground">Status</Heading5>
                                <p className="text-sm capitalize">{survey.status}</p>
                            </div>
                            <div>
                                <Heading5 className="text-muted-foreground">Created</Heading5>
                                <p className="text-sm">
                                    <RelativeDate date={new Date(survey.createdAt)} />
                                </p>
                            </div>
                            {survey.launchedAt && (
                                <div>
                                    <Heading5 className="text-muted-foreground">Launched</Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(survey.launchedAt)} />
                                    </p>
                                </div>
                            )}
                            <div>
                                <Heading5 className="text-muted-foreground">Last updated</Heading5>
                                <p className="text-sm">
                                    <RelativeDate date={new Date(survey.updatedAt)} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const SurveyQuickView = () => {
    const [surveyId, setSurveyId] = useQueryState('surveyId');

    return (
        <Sheet open={!!surveyId} onOpenChange={() => setSurveyId(null)}>
            <SheetPopup className="w-[400px] sm:w-[800px] xl:w-[1000px] max-w-none sm:max-w-none xl:max-w-none">
                <SheetHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                    <SheetTitle>Survey details</SheetTitle>
                    <SheetDescription>View the details of a survey.</SheetDescription>
                </SheetHeader>
                <div className="px-4 flex-grow overflow-auto">
                    {surveyId && (
                        <Suspense
                            fallback={
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <SpinnerGapIcon className="animate-spin" /> Fetching survey...
                                </div>
                            }
                        >
                            <SurveyDetails surveyId={surveyId} />
                        </Suspense>
                    )}
                </div>
            </SheetPopup>
        </Sheet>
    );
};

export default SurveyQuickView;

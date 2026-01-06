'use client';

import Button from '@glint/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import {Heading3, Heading5} from '@glint/ui/heading';
import RelativeDate from '@glint/ui/relative-date';
import {t} from '@/lib/i18n';
import {PencilIcon} from '@phosphor-icons/react/dist/ssr/Pencil';
import {useSuspenseQuery} from '@tanstack/react-query';
import Link from 'next/link';
import {DataTable} from '@/components/data-table';
import {cohortColumns} from '@/components/respondents/cohort-columns';
import CohortQuickView from '@/components/respondents/cohort-quick-view';
import ScoreBadge from '@/components/response-authenticity/score-badge';
import {useTRPC} from '@/lib/trpc/react';
import {surveyColumns} from './survey-columns';
import SurveyQuickView from './survey-quick-view';

interface Props {
    respondentId: string;
}

const RespondentDetails: React.FC<Props> = ({respondentId}) => {
    const trpc = useTRPC();
    const {data: respondent} = useSuspenseQuery(
        trpc.respondents.getProfile.queryOptions(respondentId)
    );

    if (!respondent) {
        return (
            <EmptyPanel
                text={t("The respondent you're looking for doesn't exist or has been removed.")}
                title={t('Respondent not found')}
            />
        );
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{t('Respondent information')}</CardTitle>
                    <Link href={`/respondents/${respondentId}/edit`}>
                        <Button size="sm" variant="outline">
                            <PencilIcon className="size-4" />
                            {t('Edit')}
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-12 gap-4">
                        <div className="md:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Heading5 className="text-muted-foreground">{t('Name')}</Heading5>
                                    <p className="text-sm">{respondent.name}</p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">{t('Email')}</Heading5>
                                    <p className="text-sm">{respondent.email}</p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">{t('Gender')}</Heading5>
                                    <p className="text-sm">
                                        {respondent.gender ? (
                                            <span className="capitalize">{respondent.gender}</span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        {t('Signup source')}
                                    </Heading5>
                                    <p className="text-sm">
                                        {respondent.signupSource ? (
                                            <span className="capitalize">
                                                {respondent.signupSource}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">{t('Created')}</Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(respondent.createdAt)} />
                                    </p>
                                </div>
                                <div>
                                    <Heading5 className="text-muted-foreground">
                                        {t('Last updated')}
                                    </Heading5>
                                    <p className="text-sm">
                                        <RelativeDate date={new Date(respondent.updatedAt)} />
                                    </p>
                                </div>
                            </div>
                            {respondent.notes && (
                                <div className="mt-4">
                                    <Heading5 className="text-muted-foreground">{t('Notes')}</Heading5>
                                    <p className="text-sm whitespace-pre-wrap">
                                        {respondent.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-4">
                            <Heading5 className="text-muted-foreground">
                                {t('Authenticity score')}
                            </Heading5>
                            {respondent.totalResponsesWithScores > 0 ? (
                                <div className="max-w-28 mt-2">
                                    <ScoreBadge score={respondent.avgAuthenticityScore} />
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('No authenticity scores available yet')}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-8">
                <Heading3 className="mb-4">{t('Cohorts')}</Heading3>
                {respondent.cohorts.length > 0 ? (
                    <DataTable
                        columns={cohortColumns}
                        data={respondent.cohorts}
                        hasPagination={false}
                        inputFilterKey={null}
                    />
                ) : (
                    <EmptyPanel
                        text={t("This respondent hasn't been assigned to any cohorts yet.")}
                        title={t('No cohorts assigned')}
                    />
                )}
            </div>
            <div className="mt-8">
                <Heading3 className="mb-4">{t('Surveys')}</Heading3>
                {respondent.surveys.length > 0 ? (
                    <DataTable
                        columns={surveyColumns}
                        data={respondent.surveys}
                        hasPagination={false}
                        inputFilterKey={null}
                    />
                ) : (
                    <EmptyPanel
                        text={t("This respondent hasn't completed any surveys yet.")}
                        title={t('No surveys completed')}
                    />
                )}
            </div>
            <CohortQuickView />
            <SurveyQuickView />
        </>
    );
};

export default RespondentDetails;

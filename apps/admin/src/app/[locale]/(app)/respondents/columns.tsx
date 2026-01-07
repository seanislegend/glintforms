'use client';

import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import type {ColumnDef} from '@tanstack/react-table';
import {Fragment} from 'react';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {RespondentList} from '@/lib/schemas/respondents';
import {humanise} from '@/utils/humanise';

export const createColumns = (t: (text: string) => string): ColumnDef<RespondentList>[] => [
    {
        accessorKey: 'id',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('ID')} />,
        cell: ({row}) => {
            const id = row.getValue('id') as string;
            return <RecordId href={`/surveys/${id}`} id={id} />;
        },
        enableSorting: false
    },
    {
        accessorKey: 'name',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Name')} />,
        cell: ({row}) => (
            <TextLink href={`/respondents/${row.original.id}`} className="max-w-[500px] truncate">
                {row.getValue('name')}
            </TextLink>
        )
    },
    {
        accessorKey: 'cohorts',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Cohorts')} />,
        cell: ({row}) => {
            const cohorts = row.getValue('cohorts') as RespondentList['cohorts'];
            if (!cohorts || cohorts.length === 0) {
                return <span className="text-muted-foreground">—</span>;
            }

            return (
                <span className="max-w-[300px] truncate text-muted-foreground">
                    {cohorts.map((cohort, index) => (
                        <Fragment key={cohort.id}>
                            <TextLink href={`/cohorts/${cohort.id}`} key={cohort.id}>
                                {cohort.name}
                            </TextLink>
                            {index < cohorts.length - 1 && <span>, </span>}
                        </Fragment>
                    ))}
                </span>
            );
        },
        filterFn: (row, _, value) => {
            const cohorts = row.getValue('cohorts') as RespondentList['cohorts'];
            if (!cohorts || cohorts.length === 0) {
                return false;
            }

            const cohortIds = cohorts.map(cohort => cohort.id);
            return value.some((selectedCohortId: string) => cohortIds.includes(selectedCohortId));
        }
    },
    {
        accessorKey: 'campaigns',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Campaigns')} />,
        cell: ({row}) => {
            const surveys = row.getValue('surveys') as RespondentList['surveys'];
            if (!surveys || surveys.length === 0) {
                return <span className="text-muted-foreground">—</span>;
            }

            const campaigns = surveys
                .filter(survey => survey.campaignId && survey.campaignTitle)
                .map(survey => ({id: survey.campaignId, title: survey.campaignTitle}));
            if (campaigns.length === 0) {
                return <span className="text-muted-foreground">—</span>;
            }

            return (
                <span className="max-w-[300px] truncate text-muted-foreground">
                    {campaigns.map((campaign, index) => (
                        <Fragment key={campaign.id}>
                            <TextLink href={`/campaigns/${campaign.id}`} key={campaign.id}>
                                {campaign.title}
                            </TextLink>
                            {index < campaigns.length - 1 && <span>, </span>}
                        </Fragment>
                    ))}
                </span>
            );
        },
        filterFn: (row, _, value) => {
            const surveys = row.getValue('surveys') as RespondentList['surveys'];
            if (!surveys || surveys.length === 0) {
                return false;
            }

            const campaignIds = surveys
                .filter(survey => survey.campaignId)
                .map(survey => survey.campaignId);
            // check if any of the selected campaign ids match any of the respondent's campaigns
            return value.some((selectedCampaignId: string) =>
                campaignIds.includes(selectedCampaignId)
            );
        }
    },
    {
        accessorKey: 'surveys',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Surveys')} />,
        cell: ({row}) => {
            const surveys = row.getValue('surveys') as RespondentList['surveys'];
            if (!surveys || surveys.length === 0) {
                return <span className="text-muted-foreground">—</span>;
            }
            return (
                <span className="max-w-[300px] truncate text-muted-foreground">
                    {surveys.map((survey, index) => (
                        <Fragment key={survey.id}>
                            <TextLink href={`/surveys/${survey.id}`} key={survey.id}>
                                {survey.title}
                            </TextLink>
                            {index < surveys.length - 1 && <span>, </span>}
                        </Fragment>
                    ))}
                </span>
            );
        },
        filterFn: (row, _, value) => {
            const surveys = row.getValue('surveys') as RespondentList['surveys'];
            if (!surveys || surveys.length === 0) {
                return false;
            }
            const surveyIds = surveys.map(survey => survey.id);
            return value.some((selectedSurveyId: string) => surveyIds.includes(selectedSurveyId));
        }
    },
    {
        accessorKey: 'gender',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Gender')} />,
        cell: ({row}) => {
            const gender = row.getValue('gender') as string;
            return gender ? (
                <span>{humanise(gender)}</span>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
        accessorKey: 'updatedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Updated at')} />,
        cell: ({row}) => {
            const updatedAt = row.getValue('updatedAt') as string;
            return <RelativeDate className="text-muted-foreground" date={new Date(updatedAt)} />;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/respondents/${row.original.id}`}
                row={row}
                editUrl={`/respondents/${row.original.id}/edit`}
            />
        )
    }
];

'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import CampaignStatusBadge from '@/components/badges/campaign-status';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import type {RespondentDetails} from '@/lib/schemas/respondents';

type SurveyWithCampaign = RespondentDetails['surveys'][0];

export const surveyColumns: ColumnDef<SurveyWithCampaign>[] = [
    {
        accessorKey: 'title',
        header: ({column}) => <DataTableColumnHeader column={column} title="Survey" />,
        cell: ({row}) => (
            <Link
                href={`/surveys/${row.original.id}/responses?filters=respondentId:${row.original.id}`}
                className="max-w-[300px] underline hover:decoration-2 underline-offset-2 truncate font-medium"
            >
                {row.getValue('title')}
            </Link>
        )
    },
    {
        accessorKey: 'campaignTitle',
        header: ({column}) => <DataTableColumnHeader column={column} title="Campaign" />,
        cell: ({row}) => {
            const survey = row.original;
            if (!survey.campaignTitle) {
                return <span className="text-muted-foreground">—</span>;
            }
            return (
                <div className="space-y-1">
                    <Link
                        href={`/campaigns/${survey.campaignId}`}
                        className="max-w-[250px] underline hover:decoration-2 underline-offset-2 truncate font-medium block"
                    >
                        {survey.campaignTitle}
                    </Link>
                    {survey.campaignDescription && (
                        <p className="text-xs text-muted-foreground max-w-[250px] truncate">
                            {survey.campaignDescription}
                        </p>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: 'campaignIsActive',
        header: ({column}) => <DataTableColumnHeader column={column} title="Campaign Status" />,
        cell: ({row}) => {
            const survey = row.original;
            if (survey.campaignIsActive === null) {
                return <span className="text-muted-foreground">—</span>;
            }
            return <CampaignStatusBadge status={survey.campaignIsActive ? 'active' : 'inactive'} />;
        }
    },
    {
        accessorKey: 'campaignCreatedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title="Campaign Created" />,
        cell: ({row}) => {
            const survey = row.original;
            if (!survey.campaignCreatedAt) {
                return <span className="text-muted-foreground">—</span>;
            }
            return (
                <RelativeDate
                    className="text-muted-foreground"
                    date={new Date(survey.campaignCreatedAt)}
                />
            );
        }
    }
];

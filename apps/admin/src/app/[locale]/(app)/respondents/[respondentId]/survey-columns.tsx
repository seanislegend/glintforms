'use client';

import Button from '@glint/ui/button';
import RelativeDate from '@glint/ui/relative-date';
import {t} from '@/lib/i18n';
import {EyeIcon} from '@phosphor-icons/react/dist/ssr/Eye';
import type {ColumnDef} from '@tanstack/react-table';
import Link from '@glint/ui/link';
import {useQueryState} from 'nuqs';
import CampaignStatusBadge from '@/components/badges/campaign-status';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import type {RespondentDetails} from '@/lib/schemas/respondents';

type SurveyWithCampaign = RespondentDetails['surveys'][0];

const QuickViewSurveyButton = ({surveyId}: {surveyId: string}) => {
    const [, setSurveyId] = useQueryState('surveyId');
    return (
        <Button onClick={() => setSurveyId(surveyId)} size="sm" variant="outline">
            <EyeIcon />
            <span className="sr-only">{t('Quick view')}</span>
        </Button>
    );
};

export const surveyColumns: ColumnDef<SurveyWithCampaign>[] = [
    {
        accessorKey: 'title',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Survey')} />,
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
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Campaign')} />,
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
        header: ({column}) => (
            <DataTableColumnHeader column={column} title={t('Campaign Status')} />
        ),
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
        header: ({column}) => (
            <DataTableColumnHeader column={column} title={t('Campaign Created')} />
        ),
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
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/surveys/${row.original.id}`}
                editUrl={`/surveys/${row.original.id}/settings?tab=details`}
                row={row}
            >
                <QuickViewSurveyButton surveyId={row.original.id} />
            </DataTableRowActions>
        )
    }
];

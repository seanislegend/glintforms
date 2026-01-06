'use client';

import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import {t} from '@/lib/i18n';
import type {ColumnDef} from '@tanstack/react-table';
import SurveyStatusBadge from '@/components/badges/survey-status';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {SurveyList} from '@/lib/schemas/surveys';

export const columns: ColumnDef<SurveyList>[] = [
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
        accessorKey: 'title',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Title')} />,
        cell: ({row}) => (
            <TextLink href={`/surveys/${row.original.id}`} className="max-w-[500px] truncate">
                {row.getValue('title')}
            </TextLink>
        )
    },
    {
        accessorKey: 'campaignTitle',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Campaign')} />,
        cell: ({row}) => (
            <TextLink
                href={`/campaigns/${row.original.campaignId}`}
                className="max-w-[500px] truncate"
            >
                {row.getValue('campaignTitle')}
            </TextLink>
        )
    },
    {
        accessorKey: 'status',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Status')} />,
        cell: ({row}) => {
            const status = row.getValue('status') as SurveyStatus;
            return <SurveyStatusBadge size="xs" status={status} />;
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
        accessorKey: 'createdAt',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Created At')} />,
        cell: ({row}) => {
            const createdAt = row.getValue('createdAt') as string;
            return <RelativeDate className="text-muted-foreground" date={new Date(createdAt)} />;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/surveys/${row.original.id}`}
                editUrl={`/surveys/${row.original.id}/settings?tab=details`}
                row={row}
            />
        )
    }
];

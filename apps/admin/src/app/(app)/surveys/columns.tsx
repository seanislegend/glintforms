'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import SurveyStatusBadge from '@/components/badges/survey-status';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {SurveyList} from '@/lib/schemas/surveys';

export const columns: ColumnDef<SurveyList>[] = [
    {
        accessorKey: 'id',
        header: ({column}) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({row}) => {
            const id = row.getValue('id') as string;
            return <RecordId href={`/surveys/${id}`} id={id} />;
        },
        enableSorting: false
    },
    {
        accessorKey: 'title',
        header: ({column}) => <DataTableColumnHeader column={column} title="Title" />,
        cell: ({row}) => (
            <Link
                href={`/surveys/${row.original.id}`}
                className="max-w-[500px] underline hover:decoration-2 underline-offset-2 truncate font-medium"
            >
                {row.getValue('title')}
            </Link>
        )
    },
    {
        accessorKey: 'campaignTitle',
        header: ({column}) => <DataTableColumnHeader column={column} title="Campaign" />,
        cell: ({row}) => (
            <Link
                href={`/campaigns/${row.original.campaignId}`}
                className="max-w-[500px] underline hover:decoration-2 underline-offset-2 truncate font-medium"
            >
                {row.getValue('campaignTitle')}
            </Link>
        )
    },
    {
        accessorKey: 'status',
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
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
        header: ({column}) => <DataTableColumnHeader column={column} title="Created At" />,
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

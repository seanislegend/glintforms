'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {CohortList} from '@/lib/schemas/cohorts';
import {humanise} from '@/utils/humanise';

export const columns: ColumnDef<CohortList>[] = [
    {
        accessorKey: 'id',
        header: ({column}) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({row}) => {
            const id = row.getValue('id') as string;
            return <RecordId href={`/cohorts/${id}`} id={id} />;
        },
        enableSorting: false
    },
    {
        accessorKey: 'name',
        header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({row}) => (
            <Link
                href={`/cohorts/${row.original.id}`}
                className="max-w-[500px] underline hover:decoration-2 underline-offset-2 truncate font-medium"
            >
                {row.getValue('name')}
            </Link>
        )
    },
    {
        accessorKey: 'description',
        header: ({column}) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({row}) => {
            const description = row.getValue('description') as string | null;
            return (
                <span className="max-w-[300px] truncate text-muted-foreground">
                    {description || '—'}
                </span>
            );
        }
    },
    {
        accessorKey: 'respondentCount',
        header: ({column}) => <DataTableColumnHeader column={column} title="Respondents" />,
        cell: ({row}) => {
            const count = row.getValue('respondentCount') as number;
            return <span className="text-sm text-muted-foreground">{count}</span>;
        }
    },
    {
        accessorKey: 'updatedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title="Last updated" />,
        cell: ({row}) => {
            const date = row.getValue('updatedAt') as Date;
            return <RelativeDate date={new Date(date)} />;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => <DataTableRowActions row={row} />,
        enableHiding: false
    }
];

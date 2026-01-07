'use client';

import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import type {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {CohortList} from '@/lib/schemas/cohorts';

export const createColumns = (t: (text: string) => string): ColumnDef<CohortList>[] => [
    {
        accessorKey: 'id',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('ID')} />,
        cell: ({row}) => {
            const id = row.getValue('id') as string;
            return <RecordId href={`/cohorts/${id}`} id={id} />;
        },
        enableSorting: false
    },
    {
        accessorKey: 'name',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Name')} />,
        cell: ({row}) => (
            <TextLink href={`/cohorts/${row.original.id}`} className="max-w-[500px] truncate">
                {row.getValue('name')}
            </TextLink>
        )
    },
    {
        accessorKey: 'description',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Description')} />,
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
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Respondents')} />,
        cell: ({row}) => {
            const count = row.getValue('respondentCount') as number;
            return <span className="text-sm text-muted-foreground">{count}</span>;
        }
    },
    {
        accessorKey: 'updatedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Last updated')} />,
        cell: ({row}) => {
            const date = row.getValue('updatedAt') as Date;
            return <RelativeDate date={new Date(date)} />;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/cohorts/${row.original.id}`}
                editUrl={`/cohorts/${row.original.id}/edit`}
                row={row}
            />
        )
    }
];

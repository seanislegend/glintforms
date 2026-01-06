'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef, Row} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import type {RespondentList} from '@/lib/schemas/respondents';
import {columns as respondentColumns} from '../../respondents/columns';

// keep the base columns but add in our cohort-specific columns
export const baseColumns = respondentColumns.filter(
    c =>
        !['cohorts', 'updatedAt', 'actions'].includes(
            ('accessorKey' in c ? c.accessorKey : c.id) || ''
        )
);

export const createColumns = (
    onDelete: (row: Row<RespondentList>) => void
): ColumnDef<RespondentList>[] => [
    ...baseColumns,
    {
        accessorKey: 'updatedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title="Updated at" />,
        cell: ({row}) => {
            const updatedAt = row.getValue('updatedAt') as string;
            return <RelativeDate className="text-muted-foreground" date={new Date(updatedAt)} />;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                deleteAction={{
                    onClick: () => onDelete(row),
                    label: 'Remove'
                }}
                detailsUrl={`/respondents/${row.original.id}`}
                row={row}
            />
        )
    }
];

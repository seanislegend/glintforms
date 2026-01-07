'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef, Row} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import type {RespondentList} from '@/lib/schemas/respondents';
import {createColumns as createRespondentColumns} from '../../respondents/columns';

export const createColumns = (
    t: (text: string) => string,
    onDelete: (row: Row<RespondentList>) => void
): ColumnDef<RespondentList>[] => {
    // keep the base columns but add in our cohort-specific columns
    const baseColumns = createRespondentColumns(t).filter(
        c =>
            !['cohorts', 'updatedAt', 'actions'].includes(
                ('accessorKey' in c ? c.accessorKey : c.id) || ''
            )
    );

    return [
        ...baseColumns,
        {
            accessorKey: 'updatedAt',
            header: ({column}) => <DataTableColumnHeader column={column} title={t('Updated at')} />,
            cell: ({row}) => {
                const updatedAt = row.getValue('updatedAt') as string;
                return (
                    <RelativeDate className="text-muted-foreground" date={new Date(updatedAt)} />
                );
            }
        },
        {
            id: 'actions',
            cell: ({row}) => (
                <DataTableRowActions
                    deleteAction={{
                        onClick: () => onDelete(row),
                        label: t('Remove')
                    }}
                    detailsUrl={`/respondents/${row.original.id}`}
                    row={row}
                />
            )
        }
    ];
};

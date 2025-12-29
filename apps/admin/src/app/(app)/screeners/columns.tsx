'use client';

import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import type {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {ScreenerList} from '@/lib/schemas/screeners';

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'age':
            return 'Age';
        case 'location':
            return 'Location';
        case 'selection':
            return 'Selection';
        default:
            return type;
    }
};

export const columns: ColumnDef<ScreenerList>[] = [
    {
        accessorKey: 'id',
        header: ({column}) => <DataTableColumnHeader column={column} title="ID" />,
        cell: ({row}) => {
            const id = row.getValue('id') as string;
            return <RecordId href={`/screeners/${id}`} id={id} />;
        },
        enableSorting: false
    },
    {
        accessorKey: 'name',
        header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({row}) => (
            <TextLink href={`/screeners/${row.original.id}`} className="max-w-[500px] truncate">
                {row.getValue('name')}
            </TextLink>
        )
    },
    {
        accessorKey: 'type',
        header: ({column}) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({row}) => {
            const type = row.getValue('type') as string;
            return <span className="text-sm">{getTypeLabel(type)}</span>;
        }
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
        accessorKey: 'surveyCount',
        header: ({column}) => <DataTableColumnHeader column={column} title="Surveys" />,
        cell: ({row}) => {
            const count = row.getValue('surveyCount') as number;
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
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/screeners/${row.original.id}`}
                editUrl={`/screeners/${row.original.id}/edit`}
                row={row}
            />
        )
    }
];


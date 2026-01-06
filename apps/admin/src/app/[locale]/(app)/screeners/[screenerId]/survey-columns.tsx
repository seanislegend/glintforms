'use client';

import {t} from '@/lib/i18n';
import type {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import type {ScreenerDetails} from '@/lib/schemas/screeners';

type Survey = ScreenerDetails['surveys'][0];

export const surveyColumns: ColumnDef<Survey>[] = [
    {
        accessorKey: 'title',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Survey')} />,
        cell: ({row}) => (
            <Link
                href={`/surveys/${row.original.id}`}
                className="max-w-[300px] underline hover:decoration-2 underline-offset-2 truncate font-medium"
            >
                {row.getValue('title')}
            </Link>
        )
    },
    {
        accessorKey: 'failureMessage',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Failure message')} />,
        cell: ({row}) => {
            const message = row.getValue('failureMessage') as string | null;
            if (!message) {
                return <span className="text-muted-foreground">—</span>;
            }
            return <span className="text-sm">{message}</span>;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/surveys/${row.original.id}`}
                editUrl={`/surveys/${row.original.id}/settings?tab=screeners`}
                row={row}
            />
        )
    }
];

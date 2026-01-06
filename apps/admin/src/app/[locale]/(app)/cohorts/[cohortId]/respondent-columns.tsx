'use client';

import Link from '@glint/ui/link';
import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {t} from '@/lib/i18n';

type RespondentInCohort = {
    id: string;
    name: string;
    email: string;
    assignedAt: Date;
    assignedBy: string | null;
};

export const respondentColumns: ColumnDef<RespondentInCohort>[] = [
    {
        accessorKey: 'name',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Name')} />,
        cell: ({row}) => (
            <Link
                href={`/respondents/${row.original.id}`}
                className="max-w-[500px] underline hover:decoration-2 underline-offset-2 truncate font-medium"
            >
                {row.getValue('name')}
            </Link>
        )
    },
    {
        accessorKey: 'email',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Email')} />,
        cell: ({row}) => (
            <span className="max-w-[300px] truncate text-muted-foreground">
                {row.getValue('email')}
            </span>
        )
    },
    {
        accessorKey: 'assignedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Assigned')} />,
        cell: ({row}) => {
            const date = row.getValue('assignedAt') as Date;
            return <RelativeDate date={new Date(date)} />;
        }
    },
    {
        accessorKey: 'assignedBy',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Assigned by')} />,
        cell: ({row}) => {
            const assignedBy = row.getValue('assignedBy') as string | null;
            return <span className="text-sm text-muted-foreground">{assignedBy || '—'}</span>;
        }
    }
];

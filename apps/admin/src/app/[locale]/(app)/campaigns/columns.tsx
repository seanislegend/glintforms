'use client';

import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import {t} from '@/lib/i18n';
import type {ColumnDef} from '@tanstack/react-table';
import CampaignStatusBadge from '@/components/badges/campaign-status';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';
import type {CampaignList} from '@/lib/schemas/campaigns';

export const columns: ColumnDef<CampaignList>[] = [
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
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Campaign')} />,
        cell: ({row}) => (
            <TextLink
                href={`/campaigns/${row.original.id}/edit`}
                className="max-w-[500px] truncate"
            >
                {row.getValue('title')}
            </TextLink>
        )
    },
    {
        accessorKey: 'isActive',
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Status')} />,
        cell: ({row}) => {
            const isActive = row.getValue('isActive');

            return <CampaignStatusBadge status={isActive ? 'active' : 'inactive'} />;
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
            <DataTableRowActions detailsUrl={`/campaigns/${row.original.id}/edit`} row={row} />
        )
    }
];

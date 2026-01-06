'use client';

import type {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {t} from '@/lib/i18n';

export type SearchResult = {
    email: string;
    gender: string | null;
    id: string;
    locationCity: string | null;
    locationCountry: string | null;
    name: string;
};

export const columns: ColumnDef<SearchResult>[] = [
    {
        accessorKey: 'name',
        cell: ({row}) => <span className="max-w-[500px] truncate">{row.getValue('name')}</span>,
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Name')} />
    },
    {
        accessorKey: 'email',
        cell: ({row}) => <span className="max-w-[300px] truncate">{row.getValue('email')}</span>,
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Email')} />
    },
    {
        accessorKey: 'gender',
        cell: ({row}) => {
            const gender = row.getValue('gender') as string | null;
            return gender ? (
                <span>{gender}</span>
            ) : (
                <span className="text-muted-foreground">{t('—')}</span>
            );
        },
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Gender')} />
    },
    {
        accessorKey: 'locationCity',
        cell: ({row}) => {
            const city = row.getValue('locationCity') as string | null;
            return city ? <span>{city}</span> : <span className="text-muted-foreground">{t('—')}</span>;
        },
        header: ({column}) => <DataTableColumnHeader column={column} title={t('City')} />
    },
    {
        accessorKey: 'locationCountry',
        cell: ({row}) => {
            const country = row.getValue('locationCountry') as string | null;
            return country ? (
                <span>{country}</span>
            ) : (
                <span className="text-muted-foreground">{t('—')}</span>
            );
        },
        header: ({column}) => <DataTableColumnHeader column={column} title={t('Country')} />
    }
];

'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import type {RespondentDetails} from '@/lib/schemas/respondents';

type CohortWithCampaign = RespondentDetails['cohorts'][0];

export const cohortColumns: ColumnDef<CohortWithCampaign>[] = [
    {
        accessorKey: 'name',
        header: ({column}) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({row}) => {
            const cohort = row.original;
            if (!cohort.name) {
                return <span className="text-muted-foreground">—</span>;
            }
            return (
                <div className="space-y-1">
                    <Link
                        href={`/cohorts/${cohort.id}`}
                        className="max-w-[250px] underline hover:decoration-2 underline-offset-2 truncate font-medium block"
                    >
                        {cohort.name}
                    </Link>
                </div>
            );
        }
    },
    {
        accessorKey: 'description',
        header: ({column}) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({row}) => {
            const cohort = row.original;
            return (
                <span className="text-sm text-muted-foreground max-w-[250px] truncate">
                    {cohort.description}
                </span>
            );
        }
    },
    {
        accessorKey: 'assignedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title="Assigned" />,
        cell: ({row}) => {
            const cohort = row.original;
            if (!cohort.assignedAt) {
                return <span className="text-muted-foreground">—</span>;
            }
            return <RelativeDate date={new Date(cohort.assignedAt)} />;
        }
    }
];

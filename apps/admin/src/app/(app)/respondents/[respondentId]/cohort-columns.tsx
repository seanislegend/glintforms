'use client';

import Button from '@glint/ui/button';
import RelativeDate from '@glint/ui/relative-date';
import {EyeIcon} from '@phosphor-icons/react/dist/ssr/Eye';
import type {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import {useQueryState} from 'nuqs';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import type {RespondentDetails} from '@/lib/schemas/respondents';

type CohortWithCampaign = RespondentDetails['cohorts'][0];

const QuickViewCohortButton = ({cohortId}: {cohortId: string}) => {
    const [, setCohortId] = useQueryState('cohortId');
    return (
        <Button onClick={() => setCohortId(cohortId)} size="sm" variant="outline">
            <EyeIcon />
            <span className="sr-only">Quick view</span>
        </Button>
    );
};

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
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/cohorts/${row.original.id}`}
                editUrl={`/cohorts/${row.original.id}/edit`}
                row={row}
            >
                <QuickViewCohortButton cohortId={row.original.id} />
            </DataTableRowActions>
        )
    }
];

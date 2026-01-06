'use client';

import {Badge} from '@glint/ui/badge';
import Button from '@glint/ui/button';
import RelativeDate from '@glint/ui/relative-date';
import {EyeIcon} from '@phosphor-icons/react/dist/ssr/Eye';
import {UserCircleDashedIcon} from '@phosphor-icons/react/dist/ssr/UserCircleDashed';
import type {ColumnDef, Row} from '@tanstack/react-table';
import {useQueryState} from 'nuqs';
import AuthenticityStatusBadge from '@/components/badges/authenticity-status';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import RecordId from '@/components/record-id';

interface ResponseList {
    endedAt: Date | null;
    id: string;
    metadata: Record<string, unknown>;
    respondentId: string | null;
    startedAt: Date;
    surveyId: string;
    was_completed: boolean;
}

const CompletionStatusCell = ({row}: {row: Row<ResponseList>}) => {
    const wasCompleted = row.getValue('was_completed') as boolean;

    return (
        <Badge variant={wasCompleted ? 'success' : 'warning'}>
            {wasCompleted ? 'Completed' : 'Incomplete'}
        </Badge>
    );
};

const QuickViewResponseButton = ({responseId}: {responseId: string}) => {
    const [, setResponseId] = useQueryState('responseId');
    return (
        <Button onClick={() => setResponseId(responseId)} size="sm" variant="outline">
            <EyeIcon />
            <span className="sr-only">Quick view</span>
        </Button>
    );
};

export const columns: ColumnDef<ResponseList>[] = [
    {
        accessorKey: 'respondentId',
        header: ({column}) => <DataTableColumnHeader column={column} title="Respondent" />,
        cell: ({row}) => {
            const respondentId = row.getValue('respondentId') as string | null;
            if (!respondentId) {
                return (
                    <div className="flex items-center gap-x-1">
                        <UserCircleDashedIcon className="size-5" />
                        <span className="text-muted-foreground">Anonymous</span>
                    </div>
                );
            }

            return <RecordId href={`/respondents/${respondentId}`} id={respondentId} />;
        },
        filterFn: (row, id, value) => {
            const filterValues = Array.isArray(value) ? value : [value];
            return filterValues.includes(row.getValue(id) as string);
        }
    },
    {
        accessorKey: 'was_completed',
        header: ({column}) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({row}) => <CompletionStatusCell row={row} />,
        filterFn: (row, id, value) => {
            const filterValues = Array.isArray(value) ? value : [value];
            return filterValues.includes(row.getValue(id));
        }
    },
    {
        accessorKey: 'authentic_response',
        header: ({column}) => <DataTableColumnHeader column={column} title="Authenticity" />,
        cell: ({row}) => <AuthenticityStatusBadge pass={row.getValue('authentic_response')} />,
        filterFn: (row, id, value) => {
            const filterValues = Array.isArray(value) ? value : [value];
            return filterValues.includes(row.getValue(id) as boolean);
        }
    },
    {
        accessorKey: 'startedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title="Started" />,
        cell: ({row}) => {
            const startedAt = row.getValue('startedAt') as Date;
            return <RelativeDate date={startedAt} />;
        }
    },
    {
        accessorKey: 'endedAt',
        header: ({column}) => <DataTableColumnHeader column={column} title="Ended" />,
        cell: ({row}) => {
            const endedAt = row.getValue('endedAt') as Date;
            return <RelativeDate className="text-muted-foreground" date={endedAt} />;
        }
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/surveys/${row.original.surveyId}/responses/${row.original.id}`}
                row={row}
            >
                <QuickViewResponseButton responseId={row.original.id} />
            </DataTableRowActions>
        )
    }
];

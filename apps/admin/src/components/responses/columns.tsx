'use client';

import RelativeDate from '@glint/ui/relative-date';
import type {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import ResponseAnswer from './answer';
import type {Answer, Question} from './types';

interface AnswerWithQuestion extends Answer {
    question: Question;
    surveyId: string;
}

export const createAnswerColumns = (
    question: Question,
    surveyId: string
): ColumnDef<AnswerWithQuestion>[] => [
    {
        accessorKey: 'value',
        cell: ({row}) => {
            const answer = row.original;
            const questionForAnswer = {
                order: question.order,
                options: Array.isArray(question.options) ? question.options : [],
                title: question.title,
                type: question.type
            };

            if (answer.wasSkipped) {
                return <span className="italic text-muted-foreground">Answer skipped</span>;
            }

            return <ResponseAnswer question={questionForAnswer} value={answer.value} />;
        },
        header: ({column}) => <DataTableColumnHeader column={column} title="Answer" />,
        enableSorting: false
    },
    {
        accessorKey: 'startedAt',
        cell: ({row}) => {
            const startedAt = row.getValue('startedAt') as Date;
            return <RelativeDate className="text-muted-foreground" date={new Date(startedAt)} />;
        },
        header: ({column}) => <DataTableColumnHeader column={column} title="Started at" />
    },
    {
        id: 'actions',
        cell: ({row}) => (
            <DataTableRowActions
                detailsUrl={`/surveys/${surveyId}/responses/${row.original.responseId}`}
                row={row}
            />
        )
    }
];

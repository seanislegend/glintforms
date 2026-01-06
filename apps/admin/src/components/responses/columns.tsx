'use client';

import RelativeDate from '@glint/ui/relative-date';
import {t} from '@/lib/i18n';
import type {ColumnDef} from '@tanstack/react-table';
import {DataTableColumnHeader} from '@/components/data-table/column-header';
import {DataTableRowActions} from '@/components/data-table/row-actions';
import type {Question} from '@/types/question-and-answers';
import ResponseAnswerValue from './answer-value';

interface AnswerWithQuestion extends ResponseAnswer {
    question: Question;
    surveyId: string;
}

export const createAnswerColumns = (
    question: Question,
    surveyId: string,
    allThemes: QuestionTheme[] | undefined
): ColumnDef<AnswerWithQuestion>[] => {
    const columns: ColumnDef<AnswerWithQuestion>[] = [
        {
            accessorKey: 'value',
            cell: ({row}) => {
                const answer = row.original;
                const questionForAnswer = {
                    metadata: question.metadata,
                    order: question.order,
                    options: Array.isArray(question.options) ? question.options : [],
                    title: question.title,
                    type: question.type
                };

                if (answer.wasSkipped) {
                    return (
                        <span className="italic text-muted-foreground">{t('Answer skipped')}</span>
                    );
                }

                return <ResponseAnswerValue answer={answer} question={questionForAnswer} />;
            },
            header: ({column}) => <DataTableColumnHeader column={column} title={t('Answer')} />,
            enableSorting: false
        }
    ];

    if (allThemes && allThemes.length > 0) {
        columns.push({
            accessorKey: 'theme',
            cell: ({row}) => {
                const theme = row.getValue('theme') as string;
                return <span className="text-muted-foreground">{theme}</span>;
            },
            filterFn: (row, _, value) => {
                const themeId = allThemes.find(theme => theme.name === row.getValue('theme'))?.id;
                return themeId === value;
            },
            header: ({column}) => <DataTableColumnHeader column={column} title={t('Theme')} />,
            enableSorting: true
        });
    }

    columns.push(
        {
            accessorKey: 'startedAt',
            cell: ({row}) => {
                const startedAt = row.getValue('startedAt') as Date;
                return (
                    <RelativeDate className="text-muted-foreground" date={new Date(startedAt)} />
                );
            },
            header: ({column}) => <DataTableColumnHeader column={column} title={t('Started at')} />,
            enableSorting: true
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
    );

    return columns;
};

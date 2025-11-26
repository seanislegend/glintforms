'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {useSuspenseQuery} from '@tanstack/react-query';
import {DataTable} from '@/components/data-table';
import {usePaginationSearchParams} from '@/components/data-table/parsers';
import {isCodedQuestion} from '@/lib/answer-formatter';
import {useTRPC} from '@/lib/trpc/react';
import {createAnswerColumns} from './columns';
import OptionDistributionChart from './option-distribution-chart';
import type {QuestionAnswersQuickLookProps} from './types';

const MAX_ANSWERS = 100;

const QuestionAnswersQuickLook: React.FC<QuestionAnswersQuickLookProps> = ({
    allThemes,
    questionId,
    surveyId
}) => {
    const trpc = useTRPC();
    const [pagination] = usePaginationSearchParams();
    const {data} = useSuspenseQuery(
        trpc.answers.getByQuestion.queryOptions({
            limit: MAX_ANSWERS,
            offset: pagination.pageIndex * pagination.pageSize,
            questionId
        })
    );

    if (!data) {
        return <EmptyPanel text="We could not find this question." title="Question not found" />;
    }

    const question = data.question;
    const answers = data.answers ?? [];
    const tableData = answers.map(a => ({...a, question, surveyId}));

    return (
        <>
            {isCodedQuestion(question.type) && (
                <>
                    <p className="mb-3 text-sm font-medium text-foreground">Selections breakdown</p>
                    <OptionDistributionChart
                        className="h-[220px]"
                        data={question.optionCounts}
                        emptyMessage="Selections will appear here once responses are recorded."
                    />
                </>
            )}
            {answers.length === 0 ? (
                <EmptyPanel
                    text="Answers will appear here once respondents reply"
                    title="Awaiting responses"
                />
            ) : (
                <DataTable
                    columns={createAnswerColumns(question, surveyId, allThemes)}
                    data={tableData}
                    facetedFilters={{
                        theme: {
                            label: 'Theme',
                            options:
                                allThemes?.map(theme => ({label: theme.name, value: theme.id})) ??
                                []
                        }
                    }}
                    hasPagination={true}
                    hasManualPagination={true}
                    rowCount={data.total}
                    inputFilterKey={null}
                    tableClassName="[&_td:nth-child(1)]:w-full [&_td:nth-child(3)]:w-[50px]"
                />
            )}
        </>
    );
};

export default QuestionAnswersQuickLook;

'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {Heading3} from '@glint/ui/heading';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@glint/ui/tabs';
import {useSuspenseQuery} from '@tanstack/react-query';
import {DataTable} from '@/components/data-table';
import {usePaginationSearchParams} from '@/components/data-table/parsers';
import CoOccurrenceMatrix from '@/components/responses/co-occurrence-matrix';
import OptionDistributionChart from '@/components/responses/option-distribution-chart';
import ResponsesThemeOverview from '@/components/responses/theme-overview';
import {isCodedQuestion, isFreeTextQuestion} from '@/lib/answer-formatter';
import {useTRPC} from '@/lib/trpc/react';
import {createAnswerColumns} from './columns';
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
        <Tabs defaultValue="overview" className="w-auto">
            <TabsList className="grid max-w-50 grid-cols-2 gap-1 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="answers">Answers</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-8">
                {isCodedQuestion(question.type) && (
                    <div>
                        <Heading3>Option distribution</Heading3>
                        <p className="text-sm text-muted-foreground mb-4">
                            This chart shows the distribution of selections for this question.
                        </p>
                        <OptionDistributionChart data={question.optionCounts ?? []} />
                    </div>
                )}
                {question.type === 'multi_select' && (
                    <div>
                        <Heading3>Co-occurrence patterns for selected options</Heading3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Percentages show how often each pair of options was selected together
                        </p>
                        <CoOccurrenceMatrix questionId={questionId} />
                    </div>
                )}
                {isFreeTextQuestion(question.type) && (
                    <div>
                        {data?.themes && data.themes.length > 0 ? (
                            <>
                                <Heading3>Theme categorisation</Heading3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Themes are categorised based on the context of the responses.
                                    The sentiment of the responses is also taken into account.
                                </p>
                                <ResponsesThemeOverview themes={data.themes} />
                            </>
                        ) : (
                            <EmptyPanel className="w-full" text="No themes generated" />
                        )}
                    </div>
                )}
            </TabsContent>
            <TabsContent value="answers">
                {answers.length === 0 ? (
                    <EmptyPanel
                        text="Answers will appear here once respondents reply"
                        title="Awaiting responses"
                    />
                ) : (
                    <DataTable
                        columns={createAnswerColumns(question, surveyId, allThemes)}
                        data={tableData}
                        hasPagination={true}
                        hasManualPagination={true}
                        rowCount={data.total}
                        inputFilterKey={null}
                        tableClassName="[&_td:nth-child(1)]:w-full [&_td:nth-child(3)]:w-[50px]"
                    />
                )}
            </TabsContent>
        </Tabs>
    );
};

export default QuestionAnswersQuickLook;

'use client';

import EmptyPanel from '@glint/ui/empty-panel';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useState} from 'react';
import {isCodedQuestion} from '@/lib/answer-formatter';
import {useTRPC} from '@/lib/trpc/react';
import AnswerContent from './answer-content';
import OptionDistributionChart from './option-distribution-chart';
import Pagination from './pagination';
import type {QuestionAnswersContentProps, QuestionAnswersQuickLookProps} from './types';

const ANSWERS_PER_PAGE = 50;

const QuestionAnswersQuickLook: React.FC<QuestionAnswersQuickLookProps> = ({
    questionId,
    surveyId
}) => {
    const [page, setPage] = useState(0);
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(
        trpc.answers.getByQuestion.queryOptions({
            limit: ANSWERS_PER_PAGE,
            offset: page * ANSWERS_PER_PAGE,
            questionId
        })
    );

    if (!data) {
        return <EmptyPanel text="We could not find this question." title="Question not found" />;
    }

    const question = data.question;
    const answers = data.answers ?? [];

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
                <QuestionAnswersContent
                    answers={answers}
                    data={data}
                    onPageChange={setPage}
                    page={page}
                    question={question}
                    surveyId={surveyId}
                />
            )}
        </>
    );
};

const QuestionAnswersContent: React.FC<QuestionAnswersContentProps> = ({
    answers,
    data,
    onPageChange,
    page,
    question,
    surveyId
}) => {
    return (
        <div className="space-y-4">
            {answers.map(answer => (
                <AnswerContent
                    answer={answer}
                    key={answer.id}
                    question={question}
                    surveyId={surveyId}
                />
            ))}
            <Pagination
                currentPage={page}
                onPageChange={onPageChange}
                pageSize={ANSWERS_PER_PAGE}
                total={data.total}
            />
        </div>
    );
};

export default QuestionAnswersQuickLook;

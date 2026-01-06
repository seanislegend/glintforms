'use client';

import {useSuspenseQuery} from '@tanstack/react-query';
import {useTRPC} from '@/lib/trpc/react';
import QuestionAnswersQuickView from './question-answers-quick-view';
import QuestionCard from './question-card';

interface Props {
    surveyId: string;
}

const AnswersList: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data: questions} = useSuspenseQuery(
        trpc.answers.getQuestionStats.queryOptions(surveyId)
    );

    return (
        <>
            <div className="animate-in fade-in duration-200 grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {questions.map(question => (
                    <QuestionCard key={question.id} question={question} />
                ))}
            </div>
            <QuestionAnswersQuickView questions={questions} surveyId={surveyId} />
        </>
    );
};

export default AnswersList;

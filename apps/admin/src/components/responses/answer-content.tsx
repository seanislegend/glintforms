'use client';

import Button from '@glint/ui/button';
import {Card, CardContent} from '@glint/ui/card';
import RelativeDate from '@glint/ui/relative-date';
import {ArrowRightIcon} from '@phosphor-icons/react/dist/ssr/ArrowRight';
import Link from '@glint/ui/link';
import RecordId from '@/components/record-id';
import type {AnswerContentProps} from '../../types/question-and-answers';
import ResponseAnswerValue from './answer-value';

const AnswerContent: React.FC<AnswerContentProps> = ({answer, question, surveyId}) => {
    const questionForAnswer = {
        order: question.order,
        options: Array.isArray(question.options) ? question.options : [],
        title: question.title,
        type: question.type
    };

    return (
        <Card className="flex flex-row gap-4">
            <CardContent className="flex-grow">
                {answer.wasSkipped ? (
                    <span className="italic text-muted-foreground">Answer skipped</span>
                ) : (
                    <ResponseAnswerValue answer={answer} question={questionForAnswer} />
                )}
                <div className="flex mt-4 gap-4 justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>
                            {answer.respondentId ? (
                                <RecordId
                                    canCopy={false}
                                    href={`/respondents/${answer.respondentId}`}
                                    id={answer.respondentId}
                                />
                            ) : (
                                'Anonymous respondent'
                            )}
                        </span>
                        <RelativeDate date={new Date(answer.startedAt)} />
                    </div>
                </div>
            </CardContent>
            <Link className="mr-4" href={`/surveys/${surveyId}/responses/${answer.responseId}`}>
                <Button variant="outline" size="sm">
                    <ArrowRightIcon />
                    <span className="sr-only">Edit</span>
                </Button>
            </Link>
        </Card>
    );
};

export default AnswerContent;

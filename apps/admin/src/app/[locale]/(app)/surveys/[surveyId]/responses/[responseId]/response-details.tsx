'use client';

import {Badge} from '@glint/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import RelativeDate from '@glint/ui/relative-date';
import TextLink from '@glint/ui/text-link';
import {t} from '@/lib/i18n';
import {ClockIcon} from '@phosphor-icons/react/dist/ssr/Clock';
import {useSuspenseQuery} from '@tanstack/react-query';
import {redirect} from 'next/navigation';
import {toast} from 'sonner';
import QuestionTypeBadge from '@/components/badges/question-type';
import ResponseStatusBadge from '@/components/badges/response-status';
import AuthenticityScoreOverview from '@/components/response-authenticity/overview';
import ResponseAnswerValue from '@/components/responses/answer-value';
import {useTRPC} from '@/lib/trpc/react';
import {humanise} from '@/utils/humanise';
import {formatDurationToClosestSecond} from '@/utils/time';

interface Props {
    responseId: string;
    surveyId: string;
}

const ResponseDetails: React.FC<React.PropsWithChildren<Props>> = ({responseId, surveyId}) => {
    const trpc = useTRPC();
    const {data} = useSuspenseQuery(trpc.responses.get.queryOptions({responseId}));
    const answers = data?.answers;
    const questions = data?.questions;
    const response = data?.response;

    if (!answers || !questions || !response) {
        toast.error(t('Response not found'), {id: '404'});
        redirect(`/surveys/${surveyId}/responses`);
    }

    const startedAt = new Date(response.startedAt);
    const endedAt = response.endedAt ? new Date(response.endedAt) : null;
    const duration = endedAt ? endedAt.getTime() - startedAt.getTime() : null;
    const minutes = duration ? Math.floor(duration / (1000 * 60)) : 0;
    const seconds = duration ? Math.floor((duration % (1000 * 60)) / 1000) : 0;

    return (
        <div className="space-y-6">
            <Card className="animate-in fade-in duration-300">
                <CardHeader>
                    <CardTitle>{t('Response information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
                        {response.respondent ? (
                            <>
                                <div>
                                    <div className="font-medium text-muted-foreground">{t('Name')}</div>
                                    <div>
                                        <TextLink href={`/respondents/${response.respondentId}`}>
                                            {response.respondent.name}
                                        </TextLink>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium text-muted-foreground">{t('Email')}</div>
                                    <div>{response.respondent.email}</div>
                                </div>
                                {response.respondent.signupSource && (
                                    <div>
                                        <div className="font-medium text-muted-foreground">
                                            {t('Source')}
                                        </div>
                                        <div>{response.respondent.signupSource}</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div>
                                <div className="font-medium text-muted-foreground">
                                    {t('Respondent ID')}
                                </div>
                                <div className="font-mono">
                                    {response.respondentId || t('Anonymous')}
                                </div>
                            </div>
                        )}
                        {response.geolocation &&
                            Object.entries(response.geolocation).length > 0 &&
                            Object.entries(response.geolocation).map(([key, value]) => (
                                <div key={key}>
                                    <div className="capitalize font-medium text-muted-foreground">
                                        {humanise(key)}
                                    </div>
                                    <div>{value?.toString()}</div>
                                </div>
                            ))}
                        <div>
                            <div className="font-medium text-muted-foreground">{t('Status')}</div>
                            <ResponseStatusBadge
                                status={response.wasCompleted ? 'completed' : 'incomplete'}
                            />
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">{t('Duration')}</div>
                            <div>{duration ? `${minutes}m ${seconds}s` : '—'}</div>
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">{t('Started')}</div>
                            <RelativeDate date={startedAt} />
                        </div>
                        <div>
                            <div className="font-medium text-muted-foreground">{t('Ended')}</div>
                            {endedAt ? <RelativeDate date={endedAt} /> : '—'}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <AuthenticityScoreOverview responseId={responseId} surveyId={surveyId} />
            <Card>
                <CardHeader>
                    <CardTitle>{t('Answers')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {answers.map(answer => {
                            const question = questions.find(q => q.id === answer.questionId);
                            console.log({answers, questions});
                            if (!question) return null;

                            return (
                                <div key={answer.id} className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        Q{question.order}:
                                                    </span>
                                                    <span className="font-medium">
                                                        {question.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <QuestionTypeBadge type={question.type} />
                                                    {answer.startedAt && answer.endedAt && (
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1  ">
                                                            <ClockIcon className="size-4" />
                                                            {formatDurationToClosestSecond(
                                                                (new Date(
                                                                    answer.endedAt
                                                                ).getTime() -
                                                                    new Date(
                                                                        answer.startedAt
                                                                    ).getTime()) /
                                                                    1000
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {answer.wasSkipped && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {t('Skipped')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {!answer.wasSkipped && (
                                        <div className="ml-6 text-sm rounded-md bg-muted p-3">
                                            <ResponseAnswerValue
                                                answer={answer}
                                                question={question}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResponseDetails;

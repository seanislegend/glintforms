'use client';

import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import {WarningIcon} from '@phosphor-icons/react/dist/ssr/Warning';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useI18n} from '@/hooks/use-i18n';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    surveyId: string;
}

const UnprocessedSubmissions: React.FC<Props> = ({surveyId}) => {
    const {t} = useI18n();
    const trpc = useTRPC();
    const {data: submissions} = useSuspenseQuery(
        trpc.unprocessedSubmissions.getBySurvey.queryOptions(surveyId)
    );

    if (!submissions || submissions.length === 0) {
        return null;
    }

    return (
        <Alert variant="warning">
            <WarningIcon weight="fill" />
            <AlertTitle>{t('Unprocessed submissions found')}</AlertTitle>
            <AlertDescription>
                <p className="mb-2">
                    {t(
                        `${submissions.length} submission${submissions.length === 1 ? '' : 's'} failed to process:`
                    )}
                </p>
                <ul className="list-disc list-outside ml-4 space-y-1">
                    {submissions.map(submission => (
                        <li key={submission.id}>
                            {submission.failureReason || t('Unknown error')} ({t('submitted')}{' '}
                            {new Date(submission.createdAt).toLocaleString()})
                        </li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
};

export default UnprocessedSubmissions;

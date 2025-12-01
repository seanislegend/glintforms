'use client';

import {Alert, AlertDescription, AlertTitle} from '@glint/ui/alert';
import {WarningIcon} from '@phosphor-icons/react/dist/ssr/Warning';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    surveyId: string;
}

const UnprocessedSubmissions: React.FC<Props> = ({surveyId}) => {
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
            <AlertTitle>Unprocessed submissions found</AlertTitle>
            <AlertDescription>
                <p className="mb-2">
                    {submissions.length} submission{submissions.length === 1 ? '' : 's'} failed to
                    process:
                </p>
                <ul className="list-disc list-outside ml-4 space-y-1">
                    {submissions.map(submission => (
                        <li key={submission.id}>
                            {submission.failureReason || 'Unknown error'} (submitted{' '}
                            {new Date(submission.createdAt).toLocaleString()})
                        </li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
};

export default UnprocessedSubmissions;

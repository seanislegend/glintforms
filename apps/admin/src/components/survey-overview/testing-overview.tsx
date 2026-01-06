'use client';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@glint/ui/card';
import Spinner from '@glint/ui/spinner';
import {useI18n} from '@/hooks/use-i18n';
import {useQuery} from '@tanstack/react-query';

interface Props {
    surveyId: string;
}

const SurveyTestingOverview: React.FC<Props> = ({surveyId}) => {
    const {t} = useI18n();
    const {data, isPending} = useQuery({
        queryKey: ['surveys', surveyId, 'testing'],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/v1/surveys/${surveyId}`,
                {method: 'GET', headers: {'Content-Type': 'application/json'}}
            );
            const data = await response.json();
            return data;
        }
    });

    return (
        <Card className="min-h-full">
            <CardHeader>
                <CardTitle>{t('Test your survey')}</CardTitle>
                <CardDescription>
                    {t(
                        'While your survey is in testing mode, you can test it by sending requests to the API. Any responses you receive will be discarded when you move to active mode.'
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPending && <Spinner />}
                {!isPending && data && (
                    <div className="space-y-4">
                        <code className="text-sm block select-all">
                            {process.env.NEXT_PUBLIC_API_URL}/v1/surveys/{surveyId}/responses
                        </code>
                        <div className="max-h-100 overflow-y-auto select-all rounded-md p-4 bg-accent">
                            <code className="text-sm whitespace-pre-wrap">
                                {JSON.stringify(data, null, 2)}
                            </code>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SurveyTestingOverview;

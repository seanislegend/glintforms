import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import TextLink from '@glint/ui/text-link';
import {t} from '@/lib/i18n';
import {CheckCircleIcon} from '@phosphor-icons/react/dist/ssr/CheckCircle';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    surveyId: string;
}

const SurveyOverviewOutstandingActions: React.FC<Props> = ({surveyId}) => {
    const trpc = useTRPC();
    const {data: actions} = useSuspenseQuery(trpc.actions.getAll.queryOptions(surveyId));
    const hasData = actions && actions.length > 0;

    return (
        <Card className="min-h-full">
            <CardHeader>
                <CardTitle>{t('Outstanding Actions')}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex">
                {hasData && (
                    <ul className="space-y-2 w-full">
                        {actions.map(item => (
                            <li
                                key={item.id}
                                className="border bg-accent/10  border-accent-foreground/20 rounded p-4"
                            >
                                <p>{item.text}</p>
                                {item.ctaUrl && item.ctaLabel && (
                                    <TextLink className="mt-2 inline-block" href={item.ctaUrl}>
                                        {item.ctaLabel}
                                    </TextLink>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {!hasData && (
                    <EmptyPanel
                        className="flex-grow"
                        Icon={CheckCircleIcon}
                        title={t('No outstanding actions')}
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default SurveyOverviewOutstandingActions;

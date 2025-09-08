import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import TextLink from '@glint/ui/text-link';
import {CheckCircleIcon} from '@phosphor-icons/react/dist/ssr/CheckCircle';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    survey: SurveyDetails;
}

const STATUS_TEXT = {
    draft: 'Your survey is currently a draft. Once you launch it, you will see any outstanding actions here.',
    launched:
        'Your survey is currently live. You can view the survey results and manage your survey settings.',
    completed:
        'Your survey is currently completed. You can view the survey results and manage your survey settings.'
};

const SurveyOverviewOutstandingActions: React.FC<Props> = ({survey}) => {
    const trpc = useTRPC();
    const {data: actions} = useSuspenseQuery(trpc.actions.getAll.queryOptions(survey.id));

    const statusText = STATUS_TEXT[survey.status as keyof typeof STATUS_TEXT];
    const hasData = actions && actions.length > 0;

    return (
        <Card className="min-h-full">
            <CardHeader>
                <CardTitle>Outstanding Actions</CardTitle>
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
                        text={statusText}
                        title="No outstanding actions"
                    />
                )}
            </CardContent>
        </Card>
    );
};

export default SurveyOverviewOutstandingActions;

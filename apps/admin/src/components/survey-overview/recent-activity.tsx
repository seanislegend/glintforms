import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import RelativeDate from '@glint/ui/relative-date';
import {CheckCircleIcon} from '@phosphor-icons/react/dist/ssr/CheckCircle';
import {useSuspenseQuery} from '@tanstack/react-query';
import {useTRPC} from '@/lib/trpc/react';

interface Props {
    survey: SurveyDetails;
}

const SurveyOverviewRecentActivity: React.FC<Props> = ({survey}) => {
    const trpc = useTRPC();
    const {data: activities} = useSuspenseQuery(trpc.activities.getAll.queryOptions(survey.id));

    return (
        <Card className="min-h-full">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex">
                {!activities || activities.length === 0 ? (
                    <EmptyPanel
                        className="flex-grow"
                        Icon={CheckCircleIcon}
                        text="You're all caught up!"
                        title="No recent activity"
                    />
                ) : (
                    <ul>
                        {activities.map(item => (
                            <li key={item.id}>
                                <p>{item.text}</p>
                                <RelativeDate
                                    className="leading-none text-xs"
                                    date={item.createdAt}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default SurveyOverviewRecentActivity;

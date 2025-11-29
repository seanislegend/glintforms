import {Card, CardContent, CardHeader, CardTitle} from '@glint/ui/card';
import SentimentBadge from '@/components/badges/sentiment';
import {formatPercentage} from '@/utils/percentage';

interface Props {
    themes: Pick<QuestionTheme, 'description' | 'name' | 'sentiment' | 'score'>[];
}

const ResponsesThemeOverview: React.FC<Props> = ({themes}) => (
    <div className="grid sm:grid-cols-2 gap-4">
        {themes.map(theme => (
            <Card key={theme.name}>
                <CardHeader className="lg:flex flex-row justify-between gap-x-6 gap-y-2">
                    <CardTitle>{theme.name}</CardTitle>
                    {theme.sentiment && (
                        <span className="-translate-y-1 lg:-translate-y-1.5">
                            <SentimentBadge sentiment={theme.sentiment} />
                        </span>
                    )}
                </CardHeader>
                <CardContent>
                    <p className="text-sm">{theme.description}</p>
                    <small className="text-xs mt-2 block text-muted-foreground">
                        {formatPercentage(theme.score)} of responses are categorised under this
                        theme.
                    </small>
                </CardContent>
            </Card>
        ))}
    </div>
);

export default ResponsesThemeOverview;

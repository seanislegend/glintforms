'use client';

import Button from '@glint/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@glint/ui/card';
import {useQueryState} from 'nuqs';
import QuestionTypeBadge from '@/components/badges/question-type';
import ResponsesThemeList from '@/components/responses/theme-list';

interface Props {
    question: QuestionWithStats;
}

const QuestionCard: React.FC<Props> = ({question}) => {
    const [, setQuestionId] = useQueryState('questionId');

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl leading-tight font-medium">
                    {question.order}. {question.title}
                </CardTitle>
                <QuestionTypeBadge type={question.type} />
            </CardHeader>
            <CardContent className="text-sm flex-grow">
                {question.themes && question.themes.length > 0 && (
                    <ResponsesThemeList themes={question.themes} />
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => setQuestionId(question.id)}
                    size="sm"
                    variant="outline"
                >
                    View all answers
                </Button>
            </CardFooter>
        </Card>
    );
};

export default QuestionCard;

'use client';

import Button from '@glint/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@glint/ui/card';
import {EyeIcon} from '@phosphor-icons/react/dist/ssr/Eye';
import {useQueryState} from 'nuqs';
import QuestionTypeBadge from '@/components/badges/question-type';

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
                {question.description && (
                    <p className="text-sm text-muted-foreground">{question.description}</p>
                )}
            </CardHeader>
            <CardContent className="text-sm flex-grow text-muted-foreground">
                <div>
                    <span className="text-3xl font-semibold text-foreground">
                        {question.uniqueAnswerCount}
                    </span>{' '}
                    unique answers recorded
                </div>
            </CardContent>
            <CardFooter className="flex items-end flex-row w-full gap-2 justify-between">
                <QuestionTypeBadge type={question.type} />
                <Button onClick={() => setQuestionId(question.id)} size="sm" variant="outline">
                    <EyeIcon />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default QuestionCard;

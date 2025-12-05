'use client';

import Button from '@glint/ui/button';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@glint/ui/card';
import EmptyPanel from '@glint/ui/empty-panel';
import {EyeIcon} from '@phosphor-icons/react/dist/ssr/Eye';
import {useQueryState} from 'nuqs';
import QuestionTypeBadge from '@/components/badges/question-type';
import OptionDistributionChart from '@/components/responses/option-distribution-chart';
import ResponsesThemeList from '@/components/responses/theme-list';
import {isCodedQuestion, isFreeTextQuestion} from '@/lib/surveys/answer-formatter';

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
                {isCodedQuestion(question.type) && (
                    <OptionDistributionChart data={question.optionCounts ?? []} showCount={false} />
                )}
                {isFreeTextQuestion(question.type) && (
                    <span className="min-h-full flex">
                        {question.themes && question.themes.length > 0 ? (
                            <ResponsesThemeList themes={question.themes} />
                        ) : (
                            <EmptyPanel className="w-full" text="No themes generated" />
                        )}
                    </span>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={() => setQuestionId(question.id)}
                    size="sm"
                    variant="outline"
                >
                    <span>View</span>
                    <EyeIcon className="size-4" />
                </Button>
            </CardFooter>
        </Card>
    );
};

export default QuestionCard;

'use client';

import {Sheet, SheetDescription, SheetHeader, SheetPopup, SheetTitle} from '@glint/ui/sheet';
import {t} from '@/lib/i18n';
import {SpinnerGapIcon} from '@phosphor-icons/react/dist/ssr/SpinnerGap';
import {useQueryState} from 'nuqs';
import {Suspense} from 'react';
import QuestionAnswersQuickLook from '@/components/responses/quick-look';

interface Props {
    questions: QuestionWithStats[];
    surveyId: string;
}

const QuestionAnswersQuickView: React.FC<Props> = ({questions, surveyId}) => {
    const [questionId, setQuestionId] = useQueryState('questionId');
    const question = questions.find(q => q.id === questionId);

    return (
        <Sheet open={!!questionId} onOpenChange={() => setQuestionId(null)}>
            <SheetPopup className="w-full sm:w-[720px] md:w-[900px] xl:w-[1400px] sm:max-w-[95vw] gap-0">
                <SheetHeader className="sticky top-0 bg-white/70 backdrop-blur-lg">
                    <SheetTitle>
                        {question?.title ? `${question.order}. ${question.title}` : t('Answers')}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-2">
                        {question?.description ?? t('All answers for this question.')}
                    </SheetDescription>
                </SheetHeader>
                <div className="px-4 flex-grow overflow-auto">
                    {questionId && (
                        <Suspense
                            fallback={
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <SpinnerGapIcon className="animate-spin" />{' '}
                                    {t('Fetching answers...')}
                                </div>
                            }
                        >
                            <QuestionAnswersQuickLook
                                allThemes={question?.themes}
                                questionId={questionId}
                                surveyId={surveyId}
                            />
                        </Suspense>
                    )}
                </div>
            </SheetPopup>
        </Sheet>
    );
};

export default QuestionAnswersQuickView;

import {Popover, PopoverPopup, PopoverTrigger} from '@glint/ui/popover';
import {ClockCounterClockwiseIcon} from '@phosphor-icons/react/dist/ssr/ClockCounterClockwise';
import QuestionRevisionsList from '@/components/responses/question-revisions-list';
import type {Question} from '@/types/question-and-answers';

interface Props {
    answerMetadata?: AnswerMetadata;
    question: Question;
}

const ResponseAnswerValueRevision: React.FC<React.PropsWithChildren<Props>> = ({
    answerMetadata,
    children,
    question
}) => {
    if (
        question.metadata?.versions &&
        question.metadata?.version &&
        answerMetadata?.questionVersion &&
        answerMetadata.questionVersion !== question.metadata.version
    ) {
        const difference = question.metadata.version - answerMetadata.questionVersion;

        return (
            <div className="flex items-center gap-2">
                {children}
                <Popover>
                    <PopoverTrigger className="text-muted-foreground p-1 hover:bg-primary hover:text-white transition duration-200 ease-in-out rounded-lg">
                        <ClockCounterClockwiseIcon className="size-4" />
                    </PopoverTrigger>
                    <PopoverPopup className="text-sm">
                        This answer was provided for a question that was revised {difference} times
                        after it was answered.
                        <QuestionRevisionsList
                            answerQuestionVersion={answerMetadata?.questionVersion}
                            question={question}
                            versions={question.metadata.versions}
                        />
                    </PopoverPopup>
                </Popover>
            </div>
        );
    }

    return children;
};

export default ResponseAnswerValueRevision;

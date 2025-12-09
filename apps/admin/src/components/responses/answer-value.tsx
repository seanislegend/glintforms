import ResponseAnswerValueRevision from './answer-value-revision';

interface Props {
    answer: ResponseAnswer;
    question: {
        metadata?: QuestionMetadata;
        order: number;
        options: any;
        title: string;
        type: string;
    };
}

const ResponseAnswerValue: React.FC<Props> = ({answer, question}) => {
    const {metadata, value} = answer;

    if (!value) {
        return <span className="text-muted-foreground">No answer provided</span>;
    }

    const options = question.options.reduce(
        (acc: Record<string, string>, option: {id: string; value: string}) => {
            acc[option.id] = option.value;
            return acc;
        },
        {}
    );

    const getAnswerForQuestionType = () => {
        switch (question.type) {
            case 'text':
                return <span className="whitespace-pre-wrap">{value}</span>;
            case 'number':
                return <span>{value}</span>;
            case 'single_select':
                return <span>{typeof value === 'string' ? options[value] : value}</span>;
            case 'multi_select':
                if (Array.isArray(value)) {
                    return (
                        <ul className="list-disc pl-2 list-inside flex flex-wrap gap-2">
                            {value.map((item: string) => (
                                <li key={item}>{options[item]}</li>
                            ))}
                        </ul>
                    );
                }
                return <span>{typeof value === 'string' ? options[value] : value}</span>;
            default:
                return <span className="font-mono text-sm">{JSON.stringify(value)}</span>;
        }
    };

    return (
        <ResponseAnswerValueRevision answerMetadata={metadata} question={question}>
            {getAnswerForQuestionType()}
        </ResponseAnswerValueRevision>
    );
};

export default ResponseAnswerValue;

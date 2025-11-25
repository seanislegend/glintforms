interface Props {
    question: {
        order: number;
        options: any;
        title: string;
        type: string;
    };
    value: any;
}

const ResponseAnswer: React.FC<Props> = ({question, value}) => {
    const options = question.options.reduce(
        (acc: Record<string, string>, option: {id: string; value: string}) => {
            acc[option.id] = option.value;
            return acc;
        },
        {}
    );

    if (!value) {
        return <span className="text-muted-foreground">No answer provided</span>;
    }

    switch (question.type) {
        case 'text':
            return <div className="whitespace-pre-wrap">{value}</div>;
        case 'number':
            return <div>{value}</div>;
        case 'single_select':
            return <div>{options[value]}</div>;
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
            return <div>{options[value]}</div>;
        default:
            return <div className="font-mono text-sm">{JSON.stringify(value)}</div>;
    }
};

export default ResponseAnswer;

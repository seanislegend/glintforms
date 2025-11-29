type AnswerValueType = string | number | boolean | null;

interface QuestionOptionCount {
    count: number;
    label: string;
    optionId: string;
}

interface QuestionTheme {
    description: string | null;
    id: string;
    name: string;
    questionId: string;
    sentiment: string | null;
    score: number;
}

interface QuestionWithStats {
    description: string | null;
    id: string;
    optionCounts?: QuestionOptionCount[];
    options: unknown;
    order: number;
    themes?: QuestionTheme[];
    title: string;
    type: string;
    uniqueAnswerCount: number;
}

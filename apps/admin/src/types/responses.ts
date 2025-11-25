type AnswerValueType = string | number | boolean | null;

interface QuestionOptionCount {
    count: number;
    label: string;
    optionId: string;
}

interface QuestionWithStats {
    description: string | null;
    id: string;
    optionCounts?: QuestionOptionCount[];
    options: unknown;
    order: number;
    title: string;
    type: string;
    uniqueAnswerCount: number;
}

interface QuestionOptionCount {
    count: number;
    label: string;
    optionId: string;
}

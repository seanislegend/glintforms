type AnswerValueType = string | number | boolean | null;

interface AnswerMetadata {
    questionVersion?: number;
}

interface Answer {
    endedAt: Date | null;
    id: string;
    metadata?: AnswerMetadata;
    questionId: string;
    respondentId: string | null;
    responseId: string;
    startedAt: Date;
    value: AnswerValueType;
    wasSkipped: boolean;
}

// biome-ignore lint: used in global type declarations
type ResponseAnswer = Omit<Answer, 'questionId' | 'respondentId' | 'responseId'> &
    Partial<Pick<Answer, 'questionId' | 'respondentId' | 'responseId'>>;

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

// biome-ignore lint: used in global type declarations
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

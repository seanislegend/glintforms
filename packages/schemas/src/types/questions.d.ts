interface Question {
    allowOther?: boolean;
    id: string;
    options?: QuestionOption[];
    randomiseOptionsOrder?: boolean;
    required: boolean;
    title: string;
    type: string;
    validations?: any[];
}

interface QuestionWithRawOptions extends Question {
    options?: {
        id: string;
        value: string;
    }[];
}

interface QuestionOption {
    label: string;
    value: string;
}

type QuestionAnswerValue = string | number | string[] | number[] | null;

interface QuestionAnswer {
    endedAt: number;
    startedAt: number;
    wasSkipped: boolean;
    value: QuestionAnswerValue;
}

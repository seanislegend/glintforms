interface Screener {
    config: Record<string, unknown>;
    id: string;
    options?: Array<{id: string; label: string}>;
    question?: string;
    type: 'age' | 'location' | 'selection';
}

interface BaseSurvey {
    allowAnonymous?: boolean;
    campaignId: string;
    closedText?: string;
    description: string | null;
    hasResponses?: boolean;
    id: string;
    isClosed?: boolean;
    isPasswordProtected?: boolean;
    maxResponses?: number;
    password?: string;
    questions?: Question[];
    screeners?: Screener[];
    status: string;
    slug: string;
    tenantId: string;
    title: string;
}

type Survey = BaseSurvey;

type SurveySettings = Record<string, any>;

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

interface SurveyResponseBody {
    answers: Record<string, QuestionAnswer>;
}

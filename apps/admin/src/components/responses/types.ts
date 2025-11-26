export interface QuestionAnswersQuickLookProps {
    allThemes: QuestionTheme[] | undefined;
    questionId: string;
    surveyId: string;
}

export interface Answer {
    endedAt: Date | null;
    id: string;
    respondentId: string | null;
    responseId: string;
    startedAt: Date;
    value: unknown;
    wasSkipped: boolean;
}

export interface Question {
    order: number;
    options: unknown;
    title: string;
    type: string;
}

export interface QuestionWithStats extends Question {
    optionCounts: Array<{count: number; label: string; optionId: string}>;
}

export interface QuestionAnswersData {
    question: QuestionWithStats;
    total: number;
}

export interface QuestionAnswersContentProps {
    answers: Answer[];
    data: QuestionAnswersData;
    onPageChange: (page: number) => void;
    page: number;
    question: Question;
    surveyId: string;
}

export interface AnswerContentProps {
    answer: Answer;
    question: Question;
    surveyId: string;
}

export interface PaginationProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    total: number;
}

export interface QuestionOption {
    label: string;
    value: string;
}

export interface BuildAuthenticityPromptProps {
    actualDurationMinutes: number;
    codedQuestions: Array<{
        id: string;
        options: Array<{id: string; value: string}>;
        title: string;
        type: string;
    }>;
    expectedDurationMinutes: number;
    responseAnswers: {
        answerValue: unknown;
        answerWasSkipped: boolean;
        questionTitle: string;
        questionOptions: unknown;
        questionType: string;
    }[];
    totalQuestions: number;
    wasCompleted: boolean;
}

export interface AuthenticityScoreMetadata {
    aiReasoning: string;
    aiScore: number;
    aiPass: boolean;
    aiPercentage: number;
    aiReason: string;
    checks: Record<string, AuthenticityScoreCheckDetails>;
    failureReasons: string[];
}

export interface AuthenticityScore {
    id: string;
}

interface AuthenticityScoreCheckDetails {
    details: string;
    passed: boolean;
}

export interface AuthenticityCalculationData {
    actualDurationMinutes: number;
    codedQuestions: Array<{
        id: string;
        options: Array<{
            id: string;
            value: string;
        }>;
        title: string;
        type: string;
    }>;
    expectedDurationMinutes: number;
    responseAnswers: Array<{
        answerValue: unknown;
        answerWasSkipped: boolean;
        questionTitle: string;
        questionOptions: unknown;
        questionType: string;
    }>;
    totalQuestions: number;
    wasCompleted: boolean;
}

interface AuthenticityScoreMetadata {
    aiReasoning: string;
    aiScore: number;
    aiPass: boolean;
    aiPercentage: number;
    aiReason: string;
    checks: Record<string, AuthenticityScoreCheckDetails>;
    failureReasons: string[];
}

interface AuthenticityScore {
    id: string;
}

interface AuthenticityScoreCheckDetails {
    details: string;
    passed: boolean;
}

interface AuthenticityCalculationData {
    expectedDurationMinutes: number;
    actualDurationMinutes: number;
    totalQuestions: number;
    wasCompleted: boolean;
    responseAnswers: Array<{
        questionTitle: string;
        questionType: string;
        questionOptions: unknown;
        answerValue: unknown;
        answerWasSkipped: boolean;
    }>;
}

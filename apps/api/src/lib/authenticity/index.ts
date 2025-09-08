import {openai} from '@ai-sdk/openai';
import {answers, type Database, questions, responses} from '@glint/database';
import {generateObject} from 'ai';
import {eq} from 'drizzle-orm';
import {type AuthenticityResult, authenticityResultSchema} from './schemas';

export const callAiService = async (prompt: string) => {
    try {
        const result = await generateObject({
            model: openai(process.env.AI_MODEL ?? 'gpt-4.1-nano'),
            system: 'You are a research authenticity auditor. Always respond with valid JSON only.',
            prompt,
            schema: authenticityResultSchema
        });

        return JSON.stringify(result.object);
    } catch (error) {
        console.error('Error calling AI service:', error);
        throw new Error('Failed to analyze authenticity. Please try again.');
    }
};

export const extractFailureReasons = (aiResult: AuthenticityResult) => {
    const reasons: string[] = [];

    if (aiResult.percentage < 100) {
        const checks = aiResult.checks;

        if (!checks.durationCheck.passed) {
            reasons.push(`Duration issue: ${checks.durationCheck.details}`);
        }
        if (!checks.relevanceCheck.passed) {
            reasons.push(`Relevance issue: ${checks.relevanceCheck.details}`);
        }
        if (!checks.optionCheck.passed) {
            reasons.push(`Option adherence issue: ${checks.optionCheck.details}`);
        }
        if (!checks.completionCheck.passed) {
            reasons.push(`Completion pattern issue: ${checks.completionCheck.details}`);
        }
        if (!checks.consistencyCheck.passed) {
            reasons.push(`Consistency issue: ${checks.consistencyCheck.details}`);
        }
        // if no specific check failed but score is still < 100, use general reasoning
        if (reasons.length === 0) {
            reasons.push(`General concerns: ${aiResult.reasoning}`);
        }
    }

    return reasons;
};

export const calculateAuthenticityData = async (
    db: Database,
    responseId: string,
    surveyId: string
): Promise<AuthenticityCalculationData> => {
    const [response] = await db
        .select({
            createdAt: responses.createdAt,
            endedAt: responses.endedAt,
            id: responses.id,
            metadata: responses.metadata,
            respondentId: responses.respondentId,
            startedAt: responses.startedAt,
            wasCompleted: responses.wasCompleted
        })
        .from(responses)
        .where(eq(responses.id, responseId))
        .limit(1);

    if (!response) {
        throw new Error('Response not found');
    }

    const surveyQuestions = await db
        .select({
            id: questions.id,
            title: questions.title,
            type: questions.type,
            options: questions.options
        })
        .from(questions)
        .where(eq(questions.surveyId, surveyId))
        .orderBy(questions.order);
    const responseAnswers = await db
        .select({
            answerValue: answers.value,
            answerWasSkipped: answers.wasSkipped,
            questionTitle: questions.title,
            questionType: questions.type,
            questionOptions: questions.options
        })
        .from(answers)
        .innerJoin(questions, eq(questions.id, answers.questionId))
        .where(eq(answers.responseId, responseId));

    const totalQuestions = surveyQuestions.length;
    const textQuestions = surveyQuestions.filter(q => q.type === 'text').length;
    const selectQuestions = surveyQuestions.filter(
        q => q.type === 'single_select' || q.type === 'multi_select'
    ).length;
    const numberQuestions = surveyQuestions.filter(q => q.type === 'number').length;

    const expectedDurationSeconds =
        textQuestions * 30 + selectQuestions * 10 + numberQuestions * 15 + 60;
    const expectedDurationMinutes = Math.round(expectedDurationSeconds / 60);
    const actualDurationSeconds =
        response.endedAt && response.startedAt
            ? Math.floor((response.endedAt.getTime() - response.startedAt.getTime()) / 1000)
            : 0;
    const actualDurationMinutes = Math.round(actualDurationSeconds / 60);

    return {
        actualDurationMinutes,
        codedQuestions: surveyQuestions
            .filter(q => q.type === 'single_select' || q.type === 'multi_select')
            .map(q => ({
                id: q.id,
                options: Array.isArray(q.options) ? q.options : [],
                title: q.title,
                type: q.type
            })),
        expectedDurationMinutes,
        responseAnswers,
        totalQuestions,
        wasCompleted: response.wasCompleted
    };
};

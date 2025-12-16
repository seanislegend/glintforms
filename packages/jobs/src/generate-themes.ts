import {openai} from '@ai-sdk/openai';
import {
    analysisThemeEntries,
    analysisThemes,
    answers,
    db,
    questions,
    surveys
} from '@glint/database';
import * as Sentry from '@sentry/node';
import {logger, schemaTask} from '@trigger.dev/sdk';
import {generateObject} from 'ai';
import {and, eq, inArray, isNotNull, not} from 'drizzle-orm';
import {
    normalizeDiacritics,
    normalizeParagraph,
    normalizeText,
    normalizeWhiteSpaces
} from 'normalize-text';
import {z} from 'zod';
import {buildThemeGenerationPrompt} from './prompts';
import {generateThemesTaskSchema} from './schema';

const themeSchema = z.object({
    themes: z.array(
        z.object({
            answerIds: z.array(z.number()),
            description: z.string(),
            name: z.string(),
            sentiment: z.string()
        })
    )
});

const answerIdsToIncrementalMap = new Map<string, number>();
const incrementalIdsToAnswerIdsMap = new Map<number, string>();

const createAnswerIdsToIncrementalMap = (answersData: Array<{id: string}>) => {
    answerIdsToIncrementalMap.clear();
    incrementalIdsToAnswerIdsMap.clear();
    answersData.forEach((answer, index) => {
        answerIdsToIncrementalMap.set(answer.id, index);
        incrementalIdsToAnswerIdsMap.set(index, answer.id);
    });
};

const normaliseAnswer = (answerValue: unknown): string => {
    // convert answer value to string (handles both text and number types)
    const answerString = typeof answerValue === 'string' ? answerValue : String(answerValue);
    let normalisedAnswer = normalizeDiacritics(
        normalizeText(normalizeParagraph(normalizeWhiteSpaces(answerString)))
    );
    // remove spaces after punctuation marks
    normalisedAnswer = normalisedAnswer.replace(
        /( – | - |\. |, |; |: |! |\? |\( |\) |\[ |\] )/g,
        match => match.trim()
    );
    normalisedAnswer = normalisedAnswer.toLowerCase();
    normalisedAnswer = normalisedAnswer.substring(0, 500);

    return normalisedAnswer;
};

const generateThemes = async (
    surveyContext: string,
    questionText: string,
    answersData: Array<{id: string; value: unknown}>
) => {
    try {
        // convert answers to minimised format for AI processing
        const minimisedAnswers: Array<[number, string]> = answersData.map(a => {
            const id = answerIdsToIncrementalMap.get(a.id);
            if (id === undefined) {
                throw new Error(`No mapped id found for answer ${a.id}`);
            }
            return [id, normaliseAnswer(a.value)];
        });
        const prompt = buildThemeGenerationPrompt({
            minimisedAnswers,
            questionText,
            surveyContext
        });
        const result = await generateObject({
            model: openai('gpt-4o'),
            prompt,
            schema: themeSchema,
            system: 'You are an expert qualitative data analyst.',
            temperature: 0.4
        });
        // calculate score as percentage of total answers that have each theme
        const totalAnswers = answersData.length;
        const themesWithScores = result.object.themes.map(t => ({
            ...t,
            score: ((t.answerIds?.length ?? 0) / totalAnswers) * 100
        }));
        // transform incremental ids back to answer ids
        const transformedThemes = themesWithScores.map(theme => ({
            answerIds: theme.answerIds.map(incrementalId => {
                const answerId = incrementalIdsToAnswerIdsMap.get(incrementalId);
                if (!answerId) {
                    throw new Error(`No answer ID found for incremental ID: ${incrementalId}`);
                }
                return answerId;
            }),
            description: theme.description,
            name: theme.name,
            score: theme.score,
            sentiment: theme.sentiment
        }));

        return {themes: transformedThemes};
    } catch (error) {
        logger.error('Error generating themes', {error});
        throw new Error('Failed to generate themes. Please try again.');
    }
};

const processThemesForQuestion = async (
    surveyData: {description: string | null; title: string},
    question: {description: string | null; id: string; title: string}
) => {
    const answersData = await db
        .select()
        .from(answers)
        .where(
            and(
                eq(answers.questionId, question.id),
                isNotNull(answers.value),
                not(eq(answers.value, ''))
            )
        );

    if (!answersData || answersData.length === 0) {
        logger.log('No answers found for question', {questionId: question.id});
        return {themes: []};
    }

    createAnswerIdsToIncrementalMap(answersData);
    const result = await generateThemes(
        `${surveyData.title} - ${surveyData.description || ''}`,
        `${question.title} - ${question.description || ''}`,
        answersData
    );

    await db.transaction(async tx => {
        await tx.delete(analysisThemes).where(eq(analysisThemes.questionId, question.id));

        for (const theme of result.themes) {
            const [newTheme] = await tx
                .insert(analysisThemes)
                .values({
                    description: theme.description,
                    name: theme.name,
                    questionId: question.id,
                    score: theme.score,
                    sentiment: theme.sentiment
                })
                .returning({id: analysisThemes.id});
            if (!newTheme) {
                throw new Error('Failed to create theme');
            }

            if (theme.answerIds.length > 0) {
                const entries = theme.answerIds.map(answerId => ({
                    answerId,
                    questionId: question.id,
                    themeId: newTheme.id
                }));

                await tx.insert(analysisThemeEntries).values(entries);
            }
        }
    });

    return result.themes;
};

export const generateThemesTask = schemaTask({
    id: 'generate-themes',
    maxDuration: 600,
    schema: generateThemesTaskSchema,
    run: async payload => {
        try {
            const {surveyId, tenantId} = payload;

            // verify survey exists and belongs to tenant
            const [survey] = await db
                .select()
                .from(surveys)
                .where(and(eq(surveys.id, surveyId), eq(surveys.tenantId, tenantId)))
                .limit(1);

            if (!survey) {
                throw new Error(
                    `Survey ${surveyId} not found or does not belong to tenant ${tenantId}`
                );
            }

            // get all text and number questions for this survey
            const allQuestions = await db
                .select()
                .from(questions)
                .where(
                    and(
                        eq(questions.surveyId, surveyId),
                        inArray(questions.type, ['text', 'number'])
                    )
                );

            if (allQuestions.length === 0) {
                logger.log('No text or number questions found for survey', {surveyId});
                return {
                    message: 'No text or number questions found for survey',
                    processedQuestions: 0,
                    success: true
                };
            }

            // get questions that have answers
            const questionsWithAnswers = await db
                .select({id: questions.id})
                .from(questions)
                .innerJoin(answers, eq(answers.questionId, questions.id))
                .where(
                    and(
                        eq(questions.surveyId, surveyId),
                        inArray(questions.type, ['text', 'number']),
                        isNotNull(answers.value),
                        not(eq(answers.value, ''))
                    )
                )
                .groupBy(questions.id);

            const questionIdsWithAnswers = questionsWithAnswers.map(q => q.id);

            if (questionIdsWithAnswers.length === 0) {
                logger.log('No questions with answers found for survey', {surveyId});
                return {
                    message: 'No questions with answers found for survey',
                    processedQuestions: 0,
                    success: true
                };
            }

            // filter to only questions that have answers
            const questionsToProcess = allQuestions.filter(q =>
                questionIdsWithAnswers.includes(q.id)
            );

            logger.log('Processing themes for questions', {
                questionCount: questionsToProcess.length,
                surveyId
            });

            let processedCount = 0;
            let errorCount = 0;

            for (const question of questionsToProcess) {
                try {
                    await processThemesForQuestion(survey, question);
                    processedCount++;
                    logger.log('Processed themes for question', {questionId: question.id});
                } catch (error) {
                    errorCount++;
                    logger.error('Failed to process themes for question', {
                        error,
                        questionId: question.id
                    });
                    Sentry.captureException(error, {
                        extra: {questionId: question.id, surveyId}
                    });
                }
            }

            return {
                errorCount,
                message: `Theme generation completed. Processed ${processedCount} of ${questionsToProcess.length} questions.`,
                processedQuestions: processedCount,
                success: true,
                totalQuestions: questionsToProcess.length
            };
        } catch (error) {
            logger.error('Failed to generate themes', {error});
            Sentry.captureException(error);

            return {
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to generate themes',
                success: false
            };
        }
    }
});

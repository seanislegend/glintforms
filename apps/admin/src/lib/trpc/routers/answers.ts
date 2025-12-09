import {
    analysisThemes,
    answers,
    type Database,
    questions,
    respondents,
    responses,
    surveys
} from '@glint/database';
import {and, asc, desc, eq, inArray, sql} from 'drizzle-orm';
import * as R from 'remeda';
import {z} from 'zod';
import type {QuestionOption} from '@/lib/schemas/questions';
import {isCodedQuestion} from '@/lib/surveys/answer-formatter';
import {protectedProcedure} from '../init';

type SelectionCountMap = Record<string, Record<string, number>>;

interface QuestionMeta {
    options: QuestionOption[];
    type: string;
}

interface AnswersRouterContext {
    db: Database;
    tenant: string;
}

export const answersRouter = {
    getByQuestion: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                offset: z.number().min(0).default(0),
                questionId: z.string()
            })
        )
        .query(async ({input: {limit, offset, questionId}, ctx}) => {
            const [question] = await ctx.db
                .select({
                    description: questions.description,
                    metadata: questions.metadata,
                    id: questions.id,
                    options: questions.options,
                    order: questions.order,
                    surveyId: questions.surveyId,
                    title: questions.title,
                    type: questions.type
                })
                .from(questions)
                .innerJoin(
                    surveys,
                    and(eq(questions.surveyId, surveys.id), eq(surveys.tenantId, ctx.tenant))
                )
                .where(eq(questions.id, questionId))
                .limit(1);
            if (!question) return null;

            const answersList = await ctx.db
                .select({
                    endedAt: answers.endedAt,
                    id: answers.id,
                    metadata: answers.metadata,
                    respondentEmail: respondents.email,
                    respondentId: respondents.id,
                    respondentName: respondents.name,
                    responseId: answers.responseId,
                    theme: analysisThemes.name,
                    startedAt: answers.startedAt,
                    value: answers.value,
                    wasSkipped: answers.wasSkipped,
                    total: sql<number>`count(*) over()`
                })
                .from(answers)
                .innerJoin(
                    responses,
                    and(eq(answers.responseId, responses.id), eq(responses.tenantId, ctx.tenant))
                )
                .leftJoin(analysisThemes, eq(answers.questionId, analysisThemes.questionId))
                .leftJoin(respondents, eq(responses.respondentId, respondents.id))
                .where(eq(answers.questionId, questionId))
                .orderBy(desc(answers.startedAt))
                .limit(limit)
                .offset(offset);

            const total = answersList[0]?.total ?? 0;
            const parsedOptions = parseQuestionOptions(question.options);
            const meta = new Map<string, QuestionMeta>([
                [question.id, {options: parsedOptions, type: question.type}]
            ]);
            const selectionCounts = await getSelectionCounts(meta, ctx, question.surveyId);
            const optionCounts = buildOptionCounts(
                question.id,
                question.type,
                parsedOptions,
                selectionCounts
            );
            const themes = await ctx.db
                .select({
                    description: analysisThemes.description,
                    name: analysisThemes.name,
                    sentiment: analysisThemes.sentiment,
                    score: analysisThemes.score
                })
                .from(analysisThemes)
                .where(eq(analysisThemes.questionId, question.id));

            return {
                answers: answersList.map(a => ({
                    endedAt: a.endedAt,
                    id: a.id,
                    metadata: a.metadata as AnswerMetadata | undefined,
                    respondentId: a.respondentId,
                    responseId: a.responseId,
                    startedAt: a.startedAt,
                    theme: a.theme,
                    value: a.value as AnswerValueType,
                    wasSkipped: a.wasSkipped
                })),
                question: {
                    description: question.description,
                    id: question.id,
                    metadata: question.metadata as QuestionMetadata,
                    optionCounts,
                    options: question.options,
                    order: question.order,
                    surveyId: question.surveyId,
                    title: question.title,
                    type: question.type
                },
                themes,
                total
            };
        }),
    getQuestionStats: protectedProcedure.input(z.string()).query(async ({input: surveyId, ctx}) => {
        const stats = await ctx.db
            .select({
                description: questions.description,
                id: questions.id,
                options: questions.options,
                order: questions.order,
                title: questions.title,
                type: questions.type,
                uniqueAnswerCount: sql<number>`count(distinct ${answers.value}::text)`
            })
            .from(questions)
            .innerJoin(
                surveys,
                and(eq(questions.surveyId, surveys.id), eq(surveys.tenantId, ctx.tenant))
            )
            .leftJoin(answers, eq(answers.questionId, questions.id))
            .where(eq(questions.surveyId, surveyId))
            .groupBy(
                questions.description,
                questions.id,
                questions.options,
                questions.order,
                questions.title,
                questions.type
            )
            .orderBy(asc(questions.order));

        const textQuestionIds = stats.filter(q => q.type === 'text').map(q => q.id);
        const themes =
            textQuestionIds.length > 0
                ? await ctx.db
                      .select({
                          description: analysisThemes.description,
                          id: analysisThemes.id,
                          name: analysisThemes.name,
                          questionId: analysisThemes.questionId,
                          sentiment: analysisThemes.sentiment,
                          score: analysisThemes.score
                      })
                      .from(analysisThemes)
                      .where(inArray(analysisThemes.questionId, textQuestionIds))
                : [];

        const themesByQuestionId = new Map<string, typeof themes>();
        for (const theme of themes) {
            const existing = themesByQuestionId.get(theme.questionId) ?? [];
            themesByQuestionId.set(theme.questionId, [...existing, theme]);
        }

        const codedQuestions = new Map<string, QuestionMeta>(
            stats
                .filter(q => isCodedQuestion(q.type))
                .map(q => [q.id, {options: parseQuestionOptions(q.options), type: q.type}])
        );
        const selectionCounts = await getSelectionCounts(codedQuestions, ctx, surveyId);

        return stats.map(question => {
            const questionThemes = themesByQuestionId.get(question.id) ?? [];
            const baseQuestion = {...question, themes: R.sortBy(questionThemes, t => t.score)};

            if (!isCodedQuestion(question.type)) return baseQuestion;

            const questionWithOptions = codedQuestions.get(question.id);
            if (!questionWithOptions) return baseQuestion;

            const optionCounts = buildOptionCounts(
                question.id,
                question.type,
                questionWithOptions.options,
                selectionCounts
            );
            return {...baseQuestion, optionCounts};
        });
    }),
    getOptionDistribution: protectedProcedure
        .input(
            z.object({
                questionId: z.string()
            })
        )
        .query(async ({input: {questionId}, ctx}) => {
            const [question] = await ctx.db
                .select({
                    id: questions.id,
                    options: questions.options,
                    surveyId: questions.surveyId,
                    type: questions.type
                })
                .from(questions)
                .innerJoin(
                    surveys,
                    and(eq(questions.surveyId, surveys.id), eq(surveys.tenantId, ctx.tenant))
                )
                .where(eq(questions.id, questionId))
                .limit(1);

            if (!question) return [];

            if (question.type !== 'multi_select' && question.type !== 'single_select') {
                return [];
            }

            const parsedOptions = parseQuestionOptions(question.options);
            if (parsedOptions.length === 0) return [];

            const meta = new Map<string, QuestionMeta>([
                [question.id, {options: parsedOptions, type: question.type}]
            ]);
            const selectionCounts = await getSelectionCounts(meta, ctx, question.surveyId);
            const optionCounts = buildOptionCounts(
                question.id,
                question.type,
                parsedOptions,
                selectionCounts
            );

            return optionCounts;
        }),
    getCoOccurrenceData: protectedProcedure
        .input(
            z.object({
                questionId: z.string()
            })
        )
        .query(async ({input: {questionId}, ctx}) => {
            const [question] = await ctx.db
                .select({
                    id: questions.id,
                    options: questions.options,
                    type: questions.type
                })
                .from(questions)
                .innerJoin(
                    surveys,
                    and(eq(questions.surveyId, surveys.id), eq(surveys.tenantId, ctx.tenant))
                )
                .where(eq(questions.id, questionId))
                .limit(1);

            if (!question || question.type !== 'multi_select') {
                return {
                    coOccurrences: {},
                    options: []
                };
            }

            const parsedOptions = parseQuestionOptions(question.options);
            if (parsedOptions.length === 0) {
                return {
                    coOccurrences: {},
                    options: []
                };
            }

            const answerRows = await ctx.db
                .select({value: answers.value})
                .from(answers)
                .innerJoin(
                    responses,
                    and(eq(answers.responseId, responses.id), eq(responses.tenantId, ctx.tenant))
                )
                .where(
                    and(
                        eq(answers.questionId, questionId),
                        eq(answers.wasSkipped, false),
                        sql`jsonb_typeof(${answers.value}) = 'array'`
                    )
                );

            // calculate co-occurrence counts (only store non-zero pairs)
            const coOccurrences: Record<string, Record<string, number>> = {};

            for (const answer of answerRows) {
                if (!answer.value || typeof answer.value !== 'object') continue;

                const selectedOptions: string[] = Array.isArray(answer.value)
                    ? answer.value.map(v => String(v))
                    : [];

                // for each pair of selected options, increment co-occurrence count
                for (let i = 0; i < selectedOptions.length; i++) {
                    for (let j = 0; j < selectedOptions.length; j++) {
                        const opt1 = selectedOptions[i];
                        const opt2 = selectedOptions[j];
                        if (opt1 && opt2) {
                            if (!coOccurrences[opt1]) {
                                coOccurrences[opt1] = {};
                            }
                            coOccurrences[opt1][opt2] = (coOccurrences[opt1][opt2] ?? 0) + 1;
                        }
                    }
                }
            }

            return {
                coOccurrences,
                options: parsedOptions.map(o => ({
                    id: String(o.id),
                    label: o.value
                })),
                totalResponses: answerRows.length
            };
        })
};

const parseQuestionOptions = (options: unknown): QuestionOption[] => {
    if (!Array.isArray(options)) return [];
    return options;
};

const getSelectionCounts = async (
    meta: Map<string, QuestionMeta>,
    ctx: AnswersRouterContext,
    surveyId: string
): Promise<SelectionCountMap> => {
    if (meta.size === 0) return {};

    const questionIds = Array.from(meta.keys());
    const singleRows = await ctx.db
        .select({
            count: sql<number>`count(*)`,
            optionId: sql<string>`${answers.value}#>>'{}'`,
            questionId: answers.questionId
        })
        .from(answers)
        .innerJoin(responses, eq(answers.responseId, responses.id))
        .where(
            and(
                inArray(answers.questionId, questionIds),
                eq(responses.surveyId, surveyId),
                eq(responses.tenantId, ctx.tenant),
                eq(answers.wasSkipped, false),
                sql`${answers.value} IS NOT NULL AND jsonb_typeof(${answers.value}) = 'string'`
            )
        )
        .groupBy(answers.questionId, sql`${answers.value}#>>'{}'`);
    const multiRows = await ctx.db
        .select({
            questionId: answers.questionId,
            optionId: sql<string>`jsonb_array_elements_text(${answers.value})`,
            count: sql<number>`count(*)`
        })
        .from(answers)
        .innerJoin(responses, eq(answers.responseId, responses.id))
        .where(
            and(
                inArray(answers.questionId, questionIds),
                eq(responses.surveyId, surveyId),
                eq(responses.tenantId, ctx.tenant),
                eq(answers.wasSkipped, false),
                sql`jsonb_typeof(${answers.value}) = 'array'`
            )
        )
        .groupBy(answers.questionId, sql`jsonb_array_elements_text(${answers.value})`);
    const map: SelectionCountMap = {};

    for (const r of [...singleRows, ...multiRows]) {
        const questionId = r.questionId;
        let questionMap = map[questionId];
        if (!questionMap) {
            questionMap = {};
            map[questionId] = questionMap;
        }
        questionMap[r.optionId] = r.count;
    }

    return map;
};

const buildOptionCounts = (
    questionId: string,
    type: string,
    options: QuestionOption[],
    selectionCounts: SelectionCountMap
): QuestionOptionCount[] => {
    if (type !== 'multi_select' && type !== 'single_select') return [];

    const counts = selectionCounts[questionId] ?? {};

    return options.map(o => {
        // answers.value stores the option ID, so we match by ID
        // try multiple formats in case of type mismatches
        const count =
            counts[String(o.id)] ??
            counts[o.id] ??
            // fallback: try matching by value in case of data inconsistencies
            counts[String(o.value)] ??
            counts[o.value] ??
            0;
        return {
            count,
            label: o.value,
            optionId: o.id
        };
    });
};

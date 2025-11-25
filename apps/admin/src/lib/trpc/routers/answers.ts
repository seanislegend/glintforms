import {answers, type Database, questions, respondents, responses, surveys} from '@glint/database';
import {and, asc, desc, eq, inArray, sql} from 'drizzle-orm';
import {z} from 'zod';
import {isCodedQuestion} from '@/lib/answer-formatter';
import type {QuestionOption} from '@/lib/schemas/questions';
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
                    respondentEmail: respondents.email,
                    respondentId: respondents.id,
                    respondentName: respondents.name,
                    responseId: answers.responseId,
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

            return {
                answers: answersList.map(a => ({
                    endedAt: a.endedAt,
                    id: a.id,
                    respondentId: a.respondentId,
                    responseId: a.responseId,
                    startedAt: a.startedAt,
                    value: a.value,
                    wasSkipped: a.wasSkipped
                })),
                question: {
                    description: question.description,
                    id: question.id,
                    optionCounts,
                    options: question.options,
                    order: question.order,
                    surveyId: question.surveyId,
                    title: question.title,
                    type: question.type
                },
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

        const codedQuestions = new Map<string, QuestionMeta>(
            stats
                .filter(q => isCodedQuestion(q.type))
                .map(q => [q.id, {options: parseQuestionOptions(q.options), type: q.type}])
        );
        const selectionCounts = await getSelectionCounts(codedQuestions, ctx, surveyId);

        return stats.map(question => {
            if (!isCodedQuestion(question.type)) return question;

            const questionWithOptions = codedQuestions.get(question.id);
            if (!questionWithOptions) return question;

            const optionCounts = buildOptionCounts(
                question.id,
                question.type,
                questionWithOptions.options,
                selectionCounts
            );
            return {...question, optionCounts};
        });
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

    return options.map(o => ({
        count: counts[o.id] ?? 0,
        label: o.value,
        optionId: o.id
    }));
};

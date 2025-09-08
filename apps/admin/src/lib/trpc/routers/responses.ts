import {
    answers,
    authenticityScores,
    questions,
    respondents,
    responses,
    surveys
} from '@glint/database';
import {and, desc, eq, sql} from 'drizzle-orm';
import {z} from 'zod';
import {AUTHENTICITY_THRESHOLD} from '@/lib/schemas/constants';
import {isAuthenticityPass} from '@/utils/authenticity';
import {mapObjectValuesToNumber} from '@/utils/map-object-values-to-number';
import {formatDuration} from '@/utils/time';
import {protectedProcedure} from '../init';

export const responsesRouter = {
    getStats: protectedProcedure.input(z.string()).query(async ({input: surveyId, ctx}) => {
        const [totalResponses] = await ctx.db
            .select({count: sql<number>`count(*)`})
            .from(responses)
            .where(eq(responses.surveyId, surveyId));
        const [completedResponses] = await ctx.db
            .select({count: sql<number>`count(*)`})
            .from(responses)
            .where(and(eq(responses.surveyId, surveyId), sql`responses.ended_at IS NOT NULL`));
        const [avgCompletionTime] = await ctx.db
            .select({avgTime: sql<number>`avg(extract(epoch from (ended_at - started_at)))`})
            .from(responses)
            .where(and(eq(responses.surveyId, surveyId), sql`responses.ended_at IS NOT NULL`));
        const [avgAuthenticityScore] = await ctx.db
            .select({
                avgScore: sql<number>`avg(authenticity_scores.percentage)`
            })
            .from(authenticityScores)
            .innerJoin(responses, eq(authenticityScores.responseId, responses.id))
            .where(
                and(eq(authenticityScores.surveyId, surveyId), sql`responses.ended_at IS NOT NULL`)
            );

        const total = totalResponses?.count || 0;
        const completed = completedResponses?.count || 0;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const avgTimeSeconds = avgCompletionTime?.avgTime || 0;
        const avgTimeMinutes = Math.round(avgTimeSeconds / 60);
        const avgScore = avgAuthenticityScore?.avgScore || 0;

        return {
            avgAuthenticityScore: Math.round(avgScore),
            completionRate: `${completionRate}%`,
            totalResponses: total,
            avgCompletionTimeMinutes: formatDuration(avgTimeMinutes)
        };
    }),
    getInsights: protectedProcedure.input(z.string()).query(async ({input: surveyId, ctx}) => {
        try {
            // combined response data by hour with authenticity rates pre-calculated
            const responsesByHour = await ctx.db
                .select({
                    hour: sql<string>`extract(hour from responses.started_at)`,
                    count: sql<number>`count(*)`,
                    completed: sql<number>`count(CASE WHEN responses.ended_at IS NOT NULL THEN 1 END)`,
                    passed: sql<number>`count(CASE WHEN responses.ended_at IS NOT NULL AND authenticity_scores.percentage >= ${AUTHENTICITY_THRESHOLD} THEN 1 END)`
                })
                .from(responses)
                .leftJoin(authenticityScores, eq(responses.id, authenticityScores.responseId))
                .where(eq(responses.surveyId, surveyId))
                .groupBy(sql`extract(hour from responses.started_at)`)
                .orderBy(sql`extract(hour from responses.started_at)`);
            // combined response data by day of week with authenticity rates pre-calculated
            const responsesByDay = await ctx.db
                .select({
                    dayOfWeek: sql<string>`extract(dow from responses.started_at)`,
                    count: sql<number>`count(*)`,
                    completed: sql<number>`count(CASE WHEN responses.ended_at IS NOT NULL THEN 1 END)`,
                    passed: sql<number>`count(CASE WHEN responses.ended_at IS NOT NULL AND authenticity_scores.percentage >= ${AUTHENTICITY_THRESHOLD} THEN 1 END)`
                })
                .from(responses)
                .leftJoin(authenticityScores, eq(responses.id, authenticityScores.responseId))
                .where(eq(responses.surveyId, surveyId))
                .groupBy(sql`extract(dow from responses.started_at)`)
                .orderBy(sql`extract(dow from responses.started_at)`);
            const genderDistribution = await ctx.db
                .select({
                    gender: respondents.gender,
                    count: sql<number>`count(*)`
                })
                .from(responses)
                .innerJoin(respondents, eq(responses.respondentId, respondents.id))
                .where(eq(responses.surveyId, surveyId))
                .groupBy(respondents.gender)
                .orderBy(respondents.gender);
            const topGeolocations = await ctx.db
                .select({
                    count: sql<number>`count(*)`,
                    country: sql<string>`responses.geolocation->>'country'`
                })
                .from(responses)
                .where(
                    and(eq(responses.surveyId, surveyId), sql`responses.geolocation IS NOT NULL`)
                )
                .groupBy(sql`responses.geolocation->>'country'`)
                .orderBy(desc(sql`count(*)`))
                .limit(5);

            const result = {
                responsesByHour: responsesByHour.map(v => mapObjectValuesToNumber(v)),
                responsesByDay: responsesByDay.map(v => mapObjectValuesToNumber(v)),
                genderDistribution: genderDistribution.map(v =>
                    mapObjectValuesToNumber(v, ['count'])
                ),
                topGeolocations: topGeolocations.map(v => mapObjectValuesToNumber(v, ['count']))
            };
            return result;
        } catch (error) {
            console.error('Error in getInsights query:', error);
            throw error;
        }
    }),
    getAll: protectedProcedure
        .input(
            z.object({
                surveyId: z.string(),
                limit: z.number().min(1).max(200).default(200),
                offset: z.number().min(0).default(0)
            })
        )
        .query(async ({input: {surveyId, limit, offset}, ctx}) => {
            const responsesList = await ctx.db
                .select({
                    authenticityPercentage: authenticityScores.percentage,
                    endedAt: responses.endedAt,
                    id: responses.id,
                    metadata: responses.metadata,
                    respondentId: responses.respondentId,
                    startedAt: responses.startedAt,
                    was_completed: responses.wasCompleted
                })
                .from(responses)
                .leftJoin(authenticityScores, eq(responses.id, authenticityScores.responseId))
                .where(eq(responses.surveyId, surveyId))
                .orderBy(desc(responses.endedAt), desc(responses.startedAt))
                .limit(limit)
                .offset(offset);
            const [total] = await ctx.db
                .select({count: sql<number>`count(*)`})
                .from(responses)
                .where(eq(responses.surveyId, surveyId));

            return {
                responses: responsesList.map(response => ({
                    ...response,
                    authentic_response: response.authenticityPercentage
                        ? isAuthenticityPass(response.authenticityPercentage)
                        : null,
                    metadata: response.metadata as Record<string, unknown>,
                    surveyId
                })),
                total: total?.count || 0
            };
        }),
    get: protectedProcedure
        .input(z.object({responseId: z.string()}))
        .query(async ({input: {responseId}, ctx}) => {
            // get the response with survey info and respondent details
            const [response] = await ctx.db
                .select({
                    createdAt: responses.createdAt,
                    endedAt: responses.endedAt,
                    id: responses.id,
                    geolocation: responses.geolocation,
                    metadata: responses.metadata,
                    respondentId: responses.respondentId,
                    startedAt: responses.startedAt,
                    surveyId: responses.surveyId,
                    wasCompleted: responses.wasCompleted,
                    campaignId: surveys.campaignId,
                    respondentName: respondents.name,
                    respondentEmail: respondents.email,
                    respondentSignupSource: respondents.signupSource
                })
                .from(responses)
                .innerJoin(surveys, eq(responses.surveyId, surveys.id))
                .leftJoin(respondents, eq(responses.respondentId, respondents.id))
                .where(and(eq(responses.id, responseId), eq(surveys.tenantId, ctx.tenant)))
                .limit(1);
            if (!response) {
                return null;
            }

            // add respondent object if respondentId exists
            const responseWithRespondent = response
                ? {
                      ...response,
                      geolocation: response.geolocation as GeolocationData | null,
                      respondent: response.respondentId
                          ? {
                                name: response.respondentName,
                                email: response.respondentEmail,
                                signupSource: response.respondentSignupSource
                            }
                          : null
                  }
                : null;

            const questionsData = await ctx.db
                .select({
                    id: questions.id,
                    order: questions.order,
                    options: questions.options,
                    title: questions.title,
                    type: questions.type
                })
                .from(questions)
                .where(eq(questions.surveyId, response.surveyId));
            const answersData = await ctx.db
                .select({
                    endedAt: answers.endedAt,
                    id: answers.id,
                    questionid: answers.questionId,
                    startedAt: answers.startedAt,
                    value: answers.value,
                    wasSkipped: answers.wasSkipped
                })
                .from(answers)
                .innerJoin(questions, eq(answers.questionId, questions.id))
                .where(eq(answers.responseId, responseId))
                .orderBy(questions.order);

            return {
                answers: answersData,
                questions: questionsData,
                response: responseWithRespondent
            };
        }),
    getLastResponseTime: protectedProcedure
        .input(z.string())
        .query(async ({input: surveyId, ctx}) => {
            const [lastResponseTime] = await ctx.db
                .select({created_at: responses.createdAt})
                .from(responses)
                .orderBy(desc(responses.createdAt))
                .where(and(eq(responses.surveyId, surveyId), eq(responses.tenantId, ctx.tenant)))
                .limit(1);
            return lastResponseTime?.created_at || null;
        })
};

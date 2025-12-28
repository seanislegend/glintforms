import {
    analysisThemeEntries,
    analysisThemes,
    answers,
    authenticityScores,
    campaigns,
    db,
    questions,
    respondents,
    responses,
    surveys
} from '@glint/database';
import {and, desc, eq, gte, inArray, isNull, lt, or, type SQL} from 'drizzle-orm';
import {AUTHENTICITY_THRESHOLD} from '@/lib/schemas/constants';

export const buildFilterConditions = (
    filters: Array<{id: string; value: Array<boolean | string | number | null>}>
) => {
    const conditions = [];

    for (const filter of filters) {
        switch (filter.id) {
            case 'was_completed':
                if (filter.value.length > 0) {
                    const booleanValues = filter.value.filter(
                        v => typeof v === 'boolean'
                    ) as boolean[];
                    if (booleanValues.length > 0) {
                        conditions.push(inArray(responses.wasCompleted, booleanValues));
                    }
                }
                break;
            case 'authentic_response':
                if (filter.value.length > 0) {
                    const booleanValues = filter.value.filter(
                        v => typeof v === 'boolean'
                    ) as boolean[];
                    const hasNull = filter.value.includes(null);

                    if (booleanValues.length > 0 && hasNull) {
                        const sqlConditions = [];
                        if (booleanValues.includes(true)) {
                            sqlConditions.push(
                                gte(authenticityScores.percentage, AUTHENTICITY_THRESHOLD)
                            );
                        }
                        if (booleanValues.includes(false)) {
                            sqlConditions.push(
                                lt(authenticityScores.percentage, AUTHENTICITY_THRESHOLD)
                            );
                        }

                        if (sqlConditions.length > 0) {
                            conditions.push(
                                or(
                                    sqlConditions.length === 1
                                        ? sqlConditions[0]
                                        : or(...sqlConditions),
                                    isNull(authenticityScores.percentage)
                                )
                            );
                        } else {
                            conditions.push(isNull(authenticityScores.percentage));
                        }
                    } else if (booleanValues.length > 0) {
                        const trueConditions = booleanValues.includes(true)
                            ? gte(authenticityScores.percentage, AUTHENTICITY_THRESHOLD)
                            : undefined;
                        const falseConditions = booleanValues.includes(false)
                            ? lt(authenticityScores.percentage, AUTHENTICITY_THRESHOLD)
                            : undefined;

                        if (trueConditions && falseConditions) {
                            conditions.push(or(trueConditions, falseConditions));
                        } else if (trueConditions) {
                            conditions.push(trueConditions);
                        } else if (falseConditions) {
                            conditions.push(falseConditions);
                        }
                    } else if (hasNull) {
                        conditions.push(isNull(authenticityScores.percentage));
                    }
                }
                break;
        }
    }

    return conditions;
};

export const fetchResponses = async (
    surveyId: string,
    filterConditions: Array<SQL<unknown> | undefined>
) => {
    const whereConditions = [eq(responses.surveyId, surveyId), ...filterConditions];

    return await db
        .select({
            authenticity_percentage: authenticityScores.percentage,
            authenticity_is_overridden: authenticityScores.isOverridden,
            authenticity_override_reason: authenticityScores.overrideReason,
            campaign: campaigns.title,
            created_at: responses.createdAt,
            ended_at: responses.endedAt,
            id: responses.id,
            respondent_id: responses.respondentId,
            respondent_name: respondents.name,
            respondent_email: respondents.email,
            respondent_source: respondents.signupSource,
            started_at: responses.startedAt,
            survey: surveys.title,
            updated_at: responses.updatedAt,
            was_completed: responses.wasCompleted
        })
        .from(responses)
        .leftJoin(authenticityScores, eq(responses.id, authenticityScores.responseId))
        .leftJoin(surveys, eq(responses.surveyId, surveys.id))
        .leftJoin(campaigns, eq(surveys.campaignId, campaigns.id))
        .leftJoin(respondents, eq(responses.respondentId, respondents.id))
        .where(and(...whereConditions))
        .orderBy(desc(responses.createdAt));
};

export const fetchAnswers = async (
    surveyId: string,
    responseIds: string[]
): Promise<
    Array<{
        answer_created_at: Date;
        answer_id: string;
        answer_updated_at: Date;
        answer_value: unknown;
        answer_was_skipped: boolean;
        question_name: string | null;
        question_options: unknown;
        question_type: string | null;
        response_id: string;
        analysis_themes: string[] | null;
        analysis_themes_descriptions: string[] | null;
        analysis_themes_sentiments: string[] | null;
    }>
> => {
    if (responseIds.length === 0) return [];
    const answersData = await db
        .select({
            answer_created_at: answers.createdAt,
            answer_id: answers.id,
            answer_updated_at: answers.updatedAt,
            answer_value: answers.value,
            answer_was_skipped: answers.wasSkipped,
            question_name: questions.title,
            question_options: questions.options,
            question_type: questions.type,
            response_id: answers.responseId
        })
        .from(answers)
        .leftJoin(questions, eq(answers.questionId, questions.id))
        .leftJoin(responses, eq(answers.responseId, responses.id))
        .where(and(eq(responses.surveyId, surveyId), inArray(responses.id, responseIds)));

    const answerIds = answersData.map(a => a.answer_id);
    if (answerIds.length === 0) {
        return answersData.map(answer => ({
            ...answer,
            analysis_themes: null,
            analysis_themes_descriptions: null,
            analysis_themes_sentiments: null
        }));
    }

    const themesData = await db
        .select({
            answer_id: analysisThemeEntries.answerId,
            theme_description: analysisThemes.description,
            theme_name: analysisThemes.name,
            theme_sentiment: analysisThemes.sentiment
        })
        .from(analysisThemeEntries)
        .innerJoin(analysisThemes, eq(analysisThemeEntries.themeId, analysisThemes.id))
        .where(inArray(analysisThemeEntries.answerId, answerIds));

    const themesByAnswerId = new Map<
        string,
        Array<{description: string | null; name: string; sentiment: string | null}>
    >();

    for (const theme of themesData) {
        const existing = themesByAnswerId.get(theme.answer_id) || [];
        existing.push({
            description: theme.theme_description,
            name: theme.theme_name,
            sentiment: theme.theme_sentiment
        });
        themesByAnswerId.set(theme.answer_id, existing);
    }

    return answersData.map(answer => {
        const themes = themesByAnswerId.get(answer.answer_id) || [];
        return {
            ...answer,
            analysis_themes: themes.length > 0 ? themes.map(t => t.name) : null,
            analysis_themes_descriptions:
                themes.length > 0 ? themes.map(t => t.description || '') : null,
            analysis_themes_sentiments:
                themes.length > 0 ? themes.map(t => t.sentiment || '') : null
        };
    });
};

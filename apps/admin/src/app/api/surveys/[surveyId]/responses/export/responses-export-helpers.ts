import {
    buildFilterConditions,
    fetchAnswers,
    fetchResponses
} from '@/app/api/surveys/[surveyId]/responses/export/export-helpers';
import {formatCodedAnswer, isCodedQuestion} from '@/lib/surveys/answer-formatter';
import {ANSWER_EXPORT_FIELDS, RESPONSE_EXPORT_FIELDS} from '@/lib/schemas/constants';
import {isAuthenticityPass} from '@/utils/authenticity';

interface ExportResponse {
    authenticity_is_overridden: boolean | null;
    authenticity_is_pass: boolean | null;
    authenticity_override_reason: string | null;
    authenticity_percentage: number | null;
    campaign: string | null;
    created_at: Date;
    ended_at: Date | null;
    id: string;
    respondent_id: string | null;
    respondent_name: string | null;
    respondent_email: string | null;
    respondent_source: string | null;
    started_at: Date;
    survey: string | null;
    updated_at: Date;
    was_completed: boolean;
}

interface ExportResponseWithAnswers extends ExportResponse {
    [key: string]: string | number | boolean | Date | null;
}

interface ProcessResponsesOptions {
    includeAnswers?: boolean;
    answerFields?: string[] | 'all';
    useCustomDelimiter?: boolean;
    codedAnswerDelimiter?: string;
    surveyId?: string;
}

export const mapResponseFields = (
    responsesData: ExportResponse[],
    selectedFields: string[]
): Record<string, string | number | boolean | Date | null>[] => {
    return responsesData.map(response => {
        const filtered: Record<string, string | number | boolean | Date | null> = {};
        selectedFields.forEach(field => {
            if (field === 'duration') {
                if (response.ended_at && response.started_at) {
                    filtered[field] =
                        (response.ended_at.getTime() - response.started_at.getTime()) / 1000;
                } else {
                    filtered[field] = null;
                }
                return;
            }
            if (field === 'authenticity_is_pass') {
                filtered[field] = response.authenticity_percentage
                    ? isAuthenticityPass(response.authenticity_percentage)
                    : null;
                return;
            }
            filtered[field] = response[field as keyof ExportResponse];
        });
        return filtered;
    });
};

export const processResponsesWithAnswers = async (
    responsesData: ExportResponse[],
    selectedFields: string[],
    options: ProcessResponsesOptions
): Promise<ExportResponseWithAnswers[]> => {
    const {includeAnswers, answerFields, useCustomDelimiter, codedAnswerDelimiter, surveyId} =
        options;

    if (!includeAnswers || responsesData.length === 0) {
        return mapResponseFields(responsesData, selectedFields) as ExportResponseWithAnswers[];
    }

    const responseIds = responsesData.map(r => r.id);
    const answersData = await fetchAnswers(surveyId || '', responseIds);
    const filteredData = mapResponseFields(responsesData, selectedFields);

    const selectedAnswerFields =
        answerFields === 'all' ? ANSWER_EXPORT_FIELDS.map(f => f.key) : answerFields || [];

    const finalData: ExportResponseWithAnswers[] = [];

    for (const response of filteredData) {
        const responseAnswers = answersData.filter(a => a.response_id === response.id);

        if (responseAnswers.length === 0) {
            // response with no answers - create a row for the response but with
            // null values for the answer fields
            const row = {...response} as ExportResponseWithAnswers;
            selectedAnswerFields.forEach(field => {
                row[field] = null;
            });
            finalData.push(row);
        } else {
            for (const answer of responseAnswers) {
                const row = {...response} as ExportResponseWithAnswers;
                selectedAnswerFields.forEach(field => {
                    if (field === 'answer_value' && isCodedQuestion(answer.question_type)) {
                        const delimiter = useCustomDelimiter ? codedAnswerDelimiter : ', ';
                        row[field] = formatCodedAnswer(
                            answer[field as keyof typeof answer] as AnswerValueType,
                            answer.question_type,
                            // @ts-expect-error - question_options is not typed
                            answer.question_options,
                            delimiter
                        );
                    } else if (field === 'analysis_themes') {
                        const themes = answer.analysis_themes as string[] | null;
                        row[field] = themes && themes.length > 0 ? themes.join(', ') : null;
                    } else if (field === 'analysis_themes_descriptions') {
                        const descriptions = answer.analysis_themes_descriptions as string[] | null;
                        if (descriptions && descriptions.length > 0) {
                            const filtered = descriptions.filter(d => d && d.trim() !== '');
                            row[field] = filtered.length > 0 ? filtered.join(', ') : null;
                        } else {
                            row[field] = null;
                        }
                    } else if (field === 'analysis_themes_sentiments') {
                        const sentiments = answer.analysis_themes_sentiments as string[] | null;
                        if (sentiments && sentiments.length > 0) {
                            const filtered = sentiments.filter(s => s && s.trim() !== '');
                            row[field] = filtered.length > 0 ? filtered.join(', ') : null;
                        } else {
                            row[field] = null;
                        }
                    } else {
                        row[field] = answer[field as keyof typeof answer] as AnswerValueType;
                    }
                });
                finalData.push(row);
            }
        }
    }

    return finalData;
};

const resolveResponseFields = (
    selectedFields: string[],
    options: ProcessResponsesOptions
): string[] => {
    const {includeAnswers, answerFields} = options;

    if (!includeAnswers) {
        return selectedFields;
    }

    return [
        ...selectedFields,
        ...(answerFields === 'all' ? ANSWER_EXPORT_FIELDS.map(f => f.key) : answerFields || [])
    ];
};

interface ExportConfig {
    dataFetcher: (
        surveyId: string,
        filters?: Array<{id: string; value: Array<boolean | string | number | null>}>
    ) => Promise<ExportResponse[]>;
    fieldMapper: typeof mapResponseFields;
    exportFields: typeof RESPONSE_EXPORT_FIELDS;
    filenamePrefix: string;
    dataProcessor: typeof processResponsesWithAnswers;
    fieldResolver: typeof resolveResponseFields;
}

export const responsesExportConfig: ExportConfig = {
    dataFetcher: async (
        surveyId: string,
        filters?: Array<{id: string; value: Array<boolean | string | number | null>}>
    ) => {
        const filterConditions = buildFilterConditions(filters || []);
        const responses = await fetchResponses(surveyId, filterConditions);
        return responses.map(response => ({
            ...response,
            authenticity_is_pass: response.authenticity_percentage
                ? isAuthenticityPass(response.authenticity_percentage)
                : null
        }));
    },
    fieldMapper: mapResponseFields,
    exportFields: RESPONSE_EXPORT_FIELDS,
    filenamePrefix: 'survey-responses',
    dataProcessor: processResponsesWithAnswers,
    fieldResolver: resolveResponseFields
};

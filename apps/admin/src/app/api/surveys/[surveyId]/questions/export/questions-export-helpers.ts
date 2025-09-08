import {db, questions, surveys} from '@glint/database';
import {asc, eq} from 'drizzle-orm';
import {QUESTION_EXPORT_FIELDS} from '@/lib/schemas/constants';
import type {QuestionOption, ValidationRule} from '@/lib/schemas/questions';

type QuestionsData = {
    allowOther: boolean;
    description: string | null;
    id: string;
    options: QuestionOption[] | null;
    order: number;
    randomiseOptionsOrder: boolean;
    required: boolean;
    title: string;
    type: string;
    validations: ValidationRule[] | null;
};

type SurveyData = {
    description: string | null;
    id: string;
    title: string;
};

type MappedQuestion = Record<string, string | number | boolean | null>;

type XLSFormSurveyRow = {
    type: string;
    name: string;
    label: string;
    required: string;
    hint?: string;
    choice_list?: string;
    constraint?: string;
};

type XLSFormChoiceRow = {
    list_name: string;
    name: string;
    label: string;
};

type XLSFormSettingsRow = {
    form_title: string;
    form_id: string;
    version: string;
    instance_name: string;
};

export const fetchQuestionsData = async (surveyId: string): Promise<QuestionsData[]> => {
    const result = await db
        .select({
            allowOther: questions.allowOther,
            description: questions.description,
            id: questions.id,
            options: questions.options,
            order: questions.order,
            randomiseOptionsOrder: questions.randomiseOptionsOrder,
            required: questions.required,
            title: questions.title,
            type: questions.type,
            validations: questions.validations
        })
        .from(questions)
        .where(eq(questions.surveyId, surveyId))
        .orderBy(asc(questions.order));

    // cast the JSON fields to proper types
    return result.map(row => ({
        ...row,
        options: row.options as QuestionOption[] | null,
        validations: row.validations as ValidationRule[] | null
    }));
};

export const fetchSurveyData = async (surveyId: string): Promise<SurveyData[]> => {
    return await db
        .select({
            description: surveys.description,
            id: surveys.id,
            title: surveys.title
        })
        .from(surveys)
        .where(eq(surveys.id, surveyId))
        .limit(1);
};

export const mapQuestionFields = (
    questionsData: QuestionsData[],
    selectedFields: string[]
): MappedQuestion[] => {
    return questionsData.map(question => {
        const filtered: Record<string, string | number | boolean | null> = {};
        selectedFields.forEach(field => {
            if (field === 'options' && Array.isArray(question.options)) {
                filtered[field] = question.options
                    .map((option: QuestionOption) => option.value)
                    .join(', ');
                return;
            }
            const value = question[field as keyof typeof question];
            filtered[field] = typeof value === 'object' ? JSON.stringify(value) : value;
        });
        return filtered;
    });
};

// xlsform mapping functions
export const mapToXLSFormSurvey = (questionsData: QuestionsData[]): XLSFormSurveyRow[] => {
    const surveyRows: XLSFormSurveyRow[] = [];

    questionsData.forEach(question => {
        const row: XLSFormSurveyRow = {
            type: mapQuestionTypeToXLSForm(question.type),
            name: `question_${question.id}`,
            label: question.title,
            required: question.required ? 'yes' : 'no'
        };

        // add description if present
        if (question.description) {
            row.hint = question.description;
        }

        // add choice list reference for single/multi select questions
        if (question.type === 'single_select' || question.type === 'multi_select') {
            row.choice_list = `choices_${question.id}`;
        }

        // add validation rules
        if (
            question.validations &&
            Array.isArray(question.validations) &&
            question.validations.length > 0
        ) {
            const constraints = question.validations
                .filter((v: ValidationRule) => v.enabled)
                .map((v: ValidationRule) => mapValidationToConstraint(v))
                .filter(Boolean);

            if (constraints.length > 0) {
                row.constraint = constraints.join(' and ');
            }
        }

        surveyRows.push(row);
    });

    return surveyRows;
};

export const mapToXLSFormChoices = (questionsData: QuestionsData[]): XLSFormChoiceRow[] => {
    const choices: XLSFormChoiceRow[] = [];
    const choiceLists = new Map<string, QuestionOption[]>();

    // collect all choice lists
    questionsData.forEach(question => {
        if (
            (question.type === 'single_select' || question.type === 'multi_select') &&
            Array.isArray(question.options)
        ) {
            const listName = `choices_${question.id}`;
            choiceLists.set(listName, question.options);
        }
    });

    // create choices sheet rows
    choiceLists.forEach((options, listName) => {
        options.forEach(option => {
            choices.push({
                list_name: listName,
                name: option.id,
                label: option.value
            });
        });
    });

    return choices;
};

export const mapToXLSFormSettings = (surveyData: SurveyData[]): XLSFormSettingsRow[] => {
    const survey = surveyData[0];
    if (!survey) {
        throw new Error('Survey data not found');
    }

    return [
        {
            form_title: survey.title,
            form_id: `survey_${survey.id}`,
            version: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            instance_name: `concat('${survey.title}', '-', string-length(string(${survey.id})))`
        }
    ];
};

const mapQuestionTypeToXLSForm = (type: string): string => {
    switch (type) {
        case 'text':
            return 'text';
        case 'number':
            return 'integer';
        case 'single_select':
            return 'select_one';
        case 'multi_select':
            return 'select_multiple';
        default:
            return 'text';
    }
};

// https://xlsform.org/en/#constraints
const mapValidationToConstraint = (validation: ValidationRule): string | null => {
    switch (validation.type) {
        case 'minLength':
            return `string-length(.) >= ${validation.value}`;
        case 'maxLength':
            return `string-length(.) <= ${validation.value}`;
        case 'min':
            return `. >= ${validation.value}`;
        case 'max':
            return `. <= ${validation.value}`;
        case 'email':
            return 'regex(., "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")';
        case 'url':
            return 'regex(., "^https?://.+")';
        case 'minSelections':
            return `count-selected(.) >= ${validation.value}`;
        case 'maxSelections':
            return `count-selected(.) <= ${validation.value}`;
        default:
            return null;
    }
};

export const questionsExportConfig = {
    dataFetcher: fetchQuestionsData,
    fieldMapper: mapQuestionFields,
    exportFields: QUESTION_EXPORT_FIELDS,
    filenamePrefix: 'survey-questions'
};

export const xlsformExportConfig = {
    dataFetcher: fetchQuestionsData,
    surveyFetcher: fetchSurveyData,
    surveyMapper: mapToXLSFormSurvey,
    choicesMapper: mapToXLSFormChoices,
    settingsMapper: mapToXLSFormSettings,
    filenamePrefix: 'survey-xlsform'
};

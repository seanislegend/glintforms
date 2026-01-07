export const MAX_QUESTIONS = 100;

export const MAX_QUESTION_OPTIONS = 20;

// no survey can have more than 1000 responses
export const MAX_RESPONSE_HARD_LIMIT = 1000;

export const RESPONSE_EXPORT_FIELDS = [
    {
        key: 'campaign',
        label: /*i18n*/ 'Campaign title',
        description: /*i18n*/ 'Title of the campaign'
    },
    {
        key: 'survey',
        label: /*i18n*/ 'Survey name',
        description: /*i18n*/ 'Name of the survey'
    },
    {
        key: 'id',
        label: /*i18n*/ 'Response ID',
        description: /*i18n*/ 'Unique identifier for the response'
    },
    {
        key: 'respondent_id',
        label: /*i18n*/ 'Respondent ID',
        description: /*i18n*/ 'Identifier for the respondent'
    },
    {
        key: 'respondent_name',
        label: /*i18n*/ 'Respondent Name',
        description: /*i18n*/ 'Name of the respondent'
    },
    {
        key: 'respondent_email',
        label: /*i18n*/ 'Respondent Email',
        description: /*i18n*/ 'Email of the respondent'
    },
    {
        key: 'respondent_source',
        label: /*i18n*/ 'Respondent Source',
        description: /*i18n*/ 'Source of the respondent'
    },
    {
        key: 'was_completed',
        label: /*i18n*/ 'Completion Status',
        description: /*i18n*/ 'Whether the survey was completed'
    },
    {
        key: 'authenticity_is_pass',
        label: /*i18n*/ 'Authenticity Status',
        description: /*i18n*/ 'Whether the response was verified as authentic'
    },
    {
        key: 'authenticity_percentage',
        label: /*i18n*/ 'Authenticity Score',
        description: /*i18n*/ 'Authenticity percentage (0-100)'
    },
    {
        key: 'authenticity_is_overridden',
        label: /*i18n*/ 'Score Overridden',
        description: /*i18n*/ 'Whether the authenticity score was manually overridden'
    },
    {
        key: 'authenticity_override_reason',
        label: /*i18n*/ 'Override Reason',
        description: /*i18n*/ 'Reason for manual override'
    },
    {
        key: 'started_at',
        label: /*i18n*/ 'Started At',
        description: /*i18n*/ 'When the survey was started'
    },
    {
        key: 'ended_at',
        label: /*i18n*/ 'Ended At',
        description: /*i18n*/ 'When the survey was completed'
    },
    {
        key: 'duration',
        label: /*i18n*/ 'Duration',
        description: /*i18n*/ 'How long the survey was completed in seconds'
    }
];

export const ANSWER_EXPORT_FIELDS = [
    {
        key: 'answer_id',
        label: /*i18n*/ 'Answer ID',
        description: /*i18n*/ 'Unique identifier for the answer'
    },
    {
        key: 'question_name',
        label: /*i18n*/ 'Question Name',
        description: /*i18n*/ 'Title of the question'
    },
    {
        key: 'answer_value',
        label: /*i18n*/ 'Answer Value',
        description: /*i18n*/ 'The actual answer provided'
    },
    {
        key: 'answer_was_skipped',
        label: /*i18n*/ 'Was Skipped',
        description: /*i18n*/ 'Whether this question was skipped'
    },
    {
        key: 'answer_created_at',
        label: /*i18n*/ 'Answer Created At',
        description: /*i18n*/ 'When the answer was created'
    },
    {
        key: 'answer_updated_at',
        label: /*i18n*/ 'Answer Updated At',
        description: /*i18n*/ 'When the answer was last updated'
    },
    {
        key: 'analysis_themes',
        label: /*i18n*/ 'Analysis Themes',
        description: /*i18n*/ 'Themes identified in the answer (comma-separated)'
    },
    {
        key: 'analysis_themes_descriptions',
        label: /*i18n*/ 'Analysis Theme Descriptions',
        description: /*i18n*/ 'Descriptions of themes identified in the answer (comma-separated)'
    },
    {
        key: 'analysis_themes_sentiments',
        label: /*i18n*/ 'Analysis Theme Sentiments',
        description: /*i18n*/ 'Sentiments of themes identified in the answer (comma-separated)'
    }
];

export const DEFAULT_CODED_ANSWER_DELIMITER = '|';

export const CONTENT_TYPES = {
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    json: 'application/json',
    xlsform: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

export const EXPORT_FORMATS = {
    csv: /*i18n*/ 'CSV',
    json: /*i18n*/ 'JSON',
    excel: /*i18n*/ 'Excel',
    xlsform: /*i18n*/ 'XLSForm'
} as const;

export const QUESTION_EXPORT_FIELDS = [
    {
        key: 'id',
        label: /*i18n*/ 'ID',
        description: /*i18n*/ 'Unique identifier for the question'
    },
    {
        key: 'title',
        label: /*i18n*/ 'Title',
        description: /*i18n*/ 'Title of the question'
    },
    {
        key: 'description',
        label: /*i18n*/ 'Description',
        description: /*i18n*/ 'Description of the question'
    },
    {
        key: 'type',
        label: /*i18n*/ 'Type',
        description: /*i18n*/ 'Type of the question'
    },
    {
        key: 'required',
        label: /*i18n*/ 'Required',
        description: /*i18n*/ 'Whether the question is required'
    },
    {
        key: 'allow_other',
        label: /*i18n*/ 'Allow Other',
        description: /*i18n*/ 'Whether the question allows other answers'
    },
    {
        key: 'randomise_options_order',
        label: /*i18n*/ 'Randomise Options Order',
        description: /*i18n*/ 'Whether the options should be randomised'
    },
    {
        key: 'options',
        label: /*i18n*/ 'Options',
        description: /*i18n*/ 'Options for the question'
    }
];

export const AUTHENTICITY_THRESHOLD = 70;

export const AUTHENTICITY_THRESHOLD_MEDIUM = 50;

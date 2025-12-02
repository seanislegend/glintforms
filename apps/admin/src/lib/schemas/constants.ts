export const MAX_QUESTIONS = 100;

export const MAX_QUESTION_OPTIONS = 20;

// no survey can have more than 1000 responses
export const MAX_RESPONSE_HARD_LIMIT = 1000;

export const RESPONSE_EXPORT_FIELDS = [
    {key: 'campaign', label: 'Campaign title', description: 'Title of the campaign'},
    {key: 'survey', label: 'Survey name', description: 'Name of the survey'},
    {key: 'id', label: 'Response ID', description: 'Unique identifier for the response'},
    {key: 'respondent_id', label: 'Respondent ID', description: 'Identifier for the respondent'},
    {key: 'respondent_name', label: 'Respondent Name', description: 'Name of the respondent'},
    {key: 'respondent_email', label: 'Respondent Email', description: 'Email of the respondent'},
    {key: 'respondent_source', label: 'Respondent Source', description: 'Source of the respondent'},
    {
        key: 'was_completed',
        label: 'Completion Status',
        description: 'Whether the survey was completed'
    },
    {
        key: 'authenticity_is_pass',
        label: 'Authenticity Status',
        description: 'Whether the response was verified as authentic'
    },
    {
        key: 'authenticity_percentage',
        label: 'Authenticity Score',
        description: 'Authenticity percentage (0-100)'
    },
    {
        key: 'authenticity_is_overridden',
        label: 'Score Overridden',
        description: 'Whether the authenticity score was manually overridden'
    },
    {
        key: 'authenticity_override_reason',
        label: 'Override Reason',
        description: 'Reason for manual override'
    },
    {key: 'started_at', label: 'Started At', description: 'When the survey was started'},
    {key: 'ended_at', label: 'Ended At', description: 'When the survey was completed'},
    {
        key: 'duration',
        label: 'Duration',
        description: 'How long the survey was completed in seconds'
    }
];

export const ANSWER_EXPORT_FIELDS = [
    {key: 'answer_id', label: 'Answer ID', description: 'Unique identifier for the answer'},
    {key: 'question_name', label: 'Question Name', description: 'Title of the question'},
    {key: 'answer_value', label: 'Answer Value', description: 'The actual answer provided'},
    {
        key: 'answer_was_skipped',
        label: 'Was Skipped',
        description: 'Whether this question was skipped'
    },
    {
        key: 'answer_created_at',
        label: 'Answer Created At',
        description: 'When the answer was created'
    },
    {
        key: 'answer_updated_at',
        label: 'Answer Updated At',
        description: 'When the answer was last updated'
    },
    {
        key: 'analysis_themes',
        label: 'Analysis Themes',
        description: 'Themes identified in the answer (comma-separated)'
    },
    {
        key: 'analysis_themes_descriptions',
        label: 'Analysis Theme Descriptions',
        description: 'Descriptions of themes identified in the answer (comma-separated)'
    },
    {
        key: 'analysis_themes_sentiments',
        label: 'Analysis Theme Sentiments',
        description: 'Sentiments of themes identified in the answer (comma-separated)'
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
    csv: 'CSV',
    json: 'JSON',
    excel: 'Excel'
} as const;

export const QUESTION_EXPORT_FIELDS = [
    {key: 'id', label: 'ID', description: 'Unique identifier for the question'},
    {key: 'title', label: 'Title', description: 'Title of the question'},
    {key: 'description', label: 'Description', description: 'Description of the question'},
    {key: 'type', label: 'Type', description: 'Type of the question'},
    {key: 'required', label: 'Required', description: 'Whether the question is required'},
    {
        key: 'allow_other',
        label: 'Allow Other',
        description: 'Whether the question allows other answers'
    },
    {
        key: 'randomise_options_order',
        label: 'Randomise Options Order',
        description: 'Whether the options should be randomised'
    },
    {key: 'options', label: 'Options', description: 'Options for the question'}
];

export const AUTHENTICITY_THRESHOLD = 70;

export const AUTHENTICITY_THRESHOLD_MEDIUM = 50;

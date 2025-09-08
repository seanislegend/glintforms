interface ExportResponseAnswer {
    answer_created_at: Date;
    answer_id: string;
    answer_updated_at: Date;
    answer_value: unknown;
    answer_was_skipped: boolean;
    question_name: string | null;
    question_type: string | null;
    response_id: string;
}

interface ExportResponse {
    authenticity_is_overridden: boolean;
    authenticity_is_pass: boolean;
    authenticity_override_reason: string;
    authenticity_percentage: number;
    campaign: string;
    duration: number | null;
    ended_at: Date | null;
    id: string;
    respondent_id: string;
    started_at: Date;
    survey: string;
    was_completed: boolean;
}

type ExportResponseWithAnswers = ExportResponseAnswer & ExportResponse;

interface ExportQuestion {
    allowOther: boolean;
    description: string;
    id: string;
    options: string;
    order: number;
    randomiseOptionsOrder: boolean;
    required: boolean;
    title: string;
    type: string;
}

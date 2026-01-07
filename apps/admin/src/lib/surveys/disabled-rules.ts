export const isDraftSurvey = (surveyStatus: SurveyStatus | null | undefined): boolean => {
    return surveyStatus === 'draft';
};

export const getReorderButtonDisabledReason = (surveyStatus: SurveyStatus | null | undefined) => {
    if (surveyStatus === 'active' || surveyStatus === 'complete') {
        /* i18n */
        return `You cannot reorder questions for a survey that is active or complete`;
    }

    return null;
};

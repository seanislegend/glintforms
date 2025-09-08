export const getReorderButtonDisabledReason = (surveyStatus: SurveyStatus | null | undefined) => {
    if (surveyStatus === 'active' || surveyStatus === 'complete') {
        return `You cannot reorder questions for a survey that is active or complete`;
    }

    return null;
};

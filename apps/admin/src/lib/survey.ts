export const surveyIsDraft = (status: SurveyStatus) => {
    return status === 'draft';
};

export const surveyIsTesting = (status: SurveyStatus) => {
    return status === 'testing';
};

export const surveyHasLaunched = (status: SurveyStatus) => {
    return status === 'active' || status === 'complete';
};

export const surveyIsActive = (status: SurveyStatus) => {
    return status === 'active';
};

export const surveyIsComplete = (status: SurveyStatus) => {
    return status === 'complete';
};

export const surveyIsArchived = (status: SurveyStatus) => {
    return status === 'archived';
};

export interface ServerContext {
    Variables: {
        responseCount?: number;
        settings: SurveySettings;
        survey: Survey;
    };
}

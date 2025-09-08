export const mockSurvey = {
    description: 'Example survey description',
    id: 'survey_id',
    isClosed: false,
    slug: 'example-survey',
    title: 'Example survey title',
    status: 'active',
    tenantId: 'tenant_id'
};

export const mockSurveySettings = {
    allowAnonymous: false,
    closeOnResponseLimit: true,
    closedText: 'This survey is now closed',
    id: 'survey_id',
    isPasswordProtected: false,
    password: null,
    maxResponses: 100,
    surveyId: mockSurvey.id
};

export const mockSurveySettingsWithPassword = {
    ...mockSurveySettings,
    isPasswordProtected: true,
    password: 'secret123'
};

export const mockQuestions = [
    {
        id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'What is your favourite colour?',
        type: 'single_select',
        options: [
            {id: 'opt1', value: 'Red'},
            {id: 'opt2', value: 'Blue'},
            {id: 'opt3', value: 'Green'}
        ],
        surveyId: mockSurvey.id,
        order: 1
    },
    {
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'How old are you?',
        type: 'number',
        options: null,
        surveyId: mockSurvey.id,
        order: 2
    }
];

export const mockResponse = {
    id: '550e8400-e29b-41d4-a716-446655440005',
    surveyId: mockSurvey.id,
    tenantId: mockSurvey.tenantId,
    startedAt: Date.now(),
    endedAt: Date.now(),
    wasCompleted: true,
    metadata: {
        ipHash: 'abc123',
        uaHash: 'def456'
    }
};

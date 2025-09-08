export const mockTextQuestion = {
    id: 'text_question_id',
    required: true,
    title: 'Example text question',
    type: 'text',
    validations: []
};

export const mockNumberQuestion = {
    id: 'number_question_id',
    required: false,
    title: 'Example number question',
    type: 'number',
    validations: []
};

export const mockSelectOption1 = {
    id: 'select_option_1',
    value: 'Select Option 1'
};
export const mockSelectOption2 = {
    id: 'select_option_2',
    value: 'Select Option 2'
};
export const mockSelectOption3 = {
    id: 'select_option_3',
    value: 'Select Option 3'
};
export const mockSelectOption4 = {
    id: 'select_option_4',
    value: 'Select Option 4'
};

export const mockSingleSelectQuestion = {
    allowOther: true,
    id: 'single_select_question_id',
    options: [mockSelectOption1, mockSelectOption2],
    randomiseOptionsOrder: true,
    required: false,
    title: 'Example single select question',
    type: 'single_select',
    validations: []
};

export const mockMutliSelectQuestion = {
    allowOther: false,
    id: 'mutli_select_question_id',
    options: [mockSelectOption1, mockSelectOption2],
    randomiseOptionsOrder: true,
    required: false,
    title: 'Example mutli select question',
    type: 'multi_select',
    validations: []
};

export const mockQuestionsList: QuestionWithRawOptions[] = [
    mockTextQuestion,
    mockNumberQuestion,
    mockSingleSelectQuestion,
    mockMutliSelectQuestion
];

// follow the same order as mockQuestionsList
export const mockQuestionAnswersList: QuestionAnswerValue[] = [
    'Hello',
    42,
    mockSelectOption1.id,
    [mockSelectOption1.id, mockSelectOption2.id]
];

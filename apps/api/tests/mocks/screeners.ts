export const mockAgeScreener = {
    config: {operator: 'over', value: 18},
    failureMessage: 'You must be over 18 to participate',
    id: 'age_screener_id',
    order: 0,
    type: 'age'
};

export const mockLocationScreener = {
    config: {countries: ['GB', 'US', 'CA']},
    failureMessage: 'This survey is only available in specific countries',
    id: 'location_screener_id',
    order: 1,
    type: 'location'
};

export const mockSingleChoiceScreener = {
    config: {
        correctOptionId: 'correct_option_id',
        options: [
            {id: 'correct_option_id', value: 'Correct Answer'},
            {id: 'wrong_option_id', value: 'Wrong Answer'}
        ],
        question: 'Are you eligible?'
    },
    failureMessage: 'You are not eligible for this survey',
    id: 'single_choice_screener_id',
    order: 2,
    type: 'single_choice'
};

export const mockScreenersList = [mockAgeScreener, mockLocationScreener, mockSingleChoiceScreener];


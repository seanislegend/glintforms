import type {QuestionOption} from '@/lib/schemas/questions';

export const formatCodedAnswer = (
    value: AnswerValueType,
    questionType: string | null,
    questionOptions: QuestionOption[] | null,
    delimiter: string = ', '
): string => {
    if (!value) return '';

    const getOption = (answerValue: AnswerValueType) => {
        if (!questionOptions) return answerValue;
        const option = questionOptions.find(o => o.id === answerValue);
        return option?.value || answerValue;
    };

    switch (questionType) {
        case 'single_select':
            return String(getOption(value));
        case 'multi_select':
            if (Array.isArray(value)) {
                return value.map(v => getOption(v)).join(delimiter);
            }
            return String(getOption(value));
        default:
            return String(getOption(value));
    }
};

export const isCodedQuestion = (questionType: string | null): boolean => {
    if (!questionType) return false;
    return questionType === 'single_select' || questionType === 'multi_select';
};

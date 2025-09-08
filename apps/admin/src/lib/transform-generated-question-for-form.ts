import {v7 as uuid} from 'uuid';
import type {GeneratedQuestion} from '@/lib/schemas/questions';

export const transformGeneratedQuestionForForm = (
    questions: GeneratedQuestion['questions'],
    surveyId: string,
    existingQuestionCount: number
) => {
    return questions.map((question, index) => ({
        ...question,
        id: uuid(),
        metadata: {generated: true},
        options: question.options.map(option => ({
            id: uuid(),
            value: option
        })),
        order: existingQuestionCount + (index + 1),
        surveyId
    }));
};

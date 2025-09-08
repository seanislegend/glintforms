import {openai} from '@ai-sdk/openai';
import {generateObject} from 'ai';
import {buildQuestionGenerationPrompt} from './prompts/question-generation';
import {generatedQuestionSchema} from './schemas/questions';
import {transformGeneratedQuestionForForm} from './transform-generated-question-for-form';

interface GenerateQuestionsProps {
    questionCount: number;
    topic?: string;
    description?: string;
    existingQuestions?: Array<{title: string; type: string}>;
    surveyId: string;
}

export const generateQuestions = async ({
    questionCount,
    topic,
    description,
    existingQuestions,
    surveyId
}: GenerateQuestionsProps) => {
    try {
        const prompt = buildQuestionGenerationPrompt({
            questionCount,
            topic,
            description,
            existingQuestions
        });
        const result = await generateObject({
            model: openai(process.env.AI_MODEL ?? 'gpt-4.1-nano'),
            system: 'You are a survey design expert. Always respond with valid JSON only.',
            prompt,
            schema: generatedQuestionSchema
        });
        const parsedQuestions = result.object.questions;
        const transformedQuestions = transformGeneratedQuestionForForm(
            parsedQuestions,
            surveyId,
            existingQuestions?.length ?? 0
        );

        return transformedQuestions;
    } catch (error) {
        console.error('Error generating questions:', error);
        throw new Error('Failed to generate questions. Please try again.');
    }
};

import {openai} from '@ai-sdk/openai';
import {generateObject} from 'ai';
import {buildQuestionConversionPrompt} from '@/lib/prompts/question-conversion';
import {aiParsedQuestionSchema} from '@/lib/schemas/questions';
import type {ParsedRow} from '@/utils/parse-import-file';

export const convertToQuestionsWithAi = async (
    parsedData: ParsedRow[]
): Promise<{
    questions: any[];
    errors?: string[];
    warnings?: string[];
}> => {
    const prompt = buildQuestionConversionPrompt(parsedData);

    try {
        const result = await generateObject({
            model: openai(process.env.AI_MODEL ?? 'gpt-4.1-nano'),
            system: 'You are a survey data conversion expert. Always respond with valid JSON only.',
            prompt,
            schema: aiParsedQuestionSchema
        });

        return {
            questions: result.object.questions,
            errors: result.object.errors,
            warnings: result.object.warnings
        };
    } catch (error) {
        console.error('Error converting questions with AI:', error);
        throw new Error(
            'Failed to convert questions. Please check your file format and try again.'
        );
    }
};

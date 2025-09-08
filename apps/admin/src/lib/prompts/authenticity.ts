import type {QuestionOption} from '@/lib/schemas/questions';

interface BuildAuthenticityPromptProps {
    expectedDurationMinutes: number;
    actualDurationMinutes: number;
    totalQuestions: number;
    wasCompleted: boolean;
    responseAnswers: {
        questionTitle: string;
        questionType: string;
        questionOptions: unknown;
        answerValue: unknown;
        answerWasSkipped: boolean;
    }[];
}

export const buildAuthenticityPrompt = ({
    expectedDurationMinutes,
    actualDurationMinutes,
    totalQuestions,
    wasCompleted,
    responseAnswers
}: BuildAuthenticityPromptProps) => {
    const formattedAnswers = responseAnswers
        .map((a, i) => {
            const optionsText = Array.isArray(a.questionOptions)
                ? a.questionOptions.map((o: QuestionOption) => o.value || o).join(', ')
                : 'n/a';

            return `
Q${i + 1}: ${a.questionTitle}
Type: ${a.questionType}
Options: ${optionsText}
Answer: ${a.answerWasSkipped ? '[skipped]' : JSON.stringify(a.answerValue)}
`;
        })
        .join('\n');

    return `
You are a research authenticity auditor.

Analyse the authenticity of this survey response based on the following context and criteria.

Context:
- Total questions: ${totalQuestions}
- Expected duration: Approx  ${expectedDurationMinutes} minutes
- Actual duration: ${actualDurationMinutes} minutes
- Was fully completed: ${wasCompleted}

Response data:
${formattedAnswers}

Evaluate the following criteria:
1. Duration consistency – Is the completion time within ±50% of expected?
2. Answer relevance – Are text responses coherent and relevant?
3. Option adherence – Are selection answers valid choices?
4. Completion pattern – Does engagement appear genuine?
5. Answer consistency – Are related answers logically aligned?

Respond with a JSON object:
{
  "percentage": number (0-100),
  "reasoning": string,
  "checks": {
    "durationCheck": { "passed": boolean, "details": string },
    "relevanceCheck": { "passed": boolean, "details": string },
    "optionCheck": { "passed": boolean, "details": string },
    "completionCheck": { "passed": boolean, "details": string },
    "consistencyCheck": { "passed": boolean, "details": string }
  }
}

IMPORTANT: Ensure all property names are spelled exactly as shown above, especially "consistencyCheck" (with two 's' characters).
`.trim();
};

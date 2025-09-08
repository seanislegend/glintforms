interface BuildAuthenticityPromptProps {
    actualDurationMinutes: number;
    codedQuestions: Array<{
        id: string;
        options: Array<{
            id: string;
            value: string;
        }>;
        title: string;
        type: string;
    }>;
    expectedDurationMinutes: number;
    responseAnswers: {
        answerValue: unknown;
        answerWasSkipped: boolean;
        questionTitle: string;
        questionOptions: unknown;
        questionType: string;
    }[];
    totalQuestions: number;
    wasCompleted: boolean;
}

export const buildAuthenticityPrompt = ({
    actualDurationMinutes,
    codedQuestions,
    expectedDurationMinutes,
    responseAnswers,
    totalQuestions,
    wasCompleted
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

    const codedQuestionsInfo =
        codedQuestions.length > 0
            ? `\nCoded questions validation:\n${codedQuestions
                  .map(
                      q =>
                          `${q.title} (${q.type}): Valid options - ${q.options.map(o => `${o.value} (ID: ${o.id})`).join(', ')}`
                  )
                  .join('\n')}`
            : '\nNo coded questions in this survey.';

    return `
You are a research authenticity auditor.

Analyse the authenticity of this survey response based on the following context and criteria.

Context:
- Total questions: ${totalQuestions}
- Expected duration: Approx  ${expectedDurationMinutes} minutes
- Actual duration: ${actualDurationMinutes} minutes
- Was fully completed: ${wasCompleted}${codedQuestionsInfo}

Response data:
${formattedAnswers}

Evaluate the following criteria:
1. Duration consistency – Is the completion time within ±50% of expected?
2. Answer relevance – Are text responses coherent and relevant?
3. Option adherence – Are selection answers valid choices? (Use the coded questions validation info above to verify option validity)
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

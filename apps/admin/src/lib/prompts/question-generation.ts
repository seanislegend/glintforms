interface Props {
    questionCount: number;
    topic?: string;
    description?: string;
    existingQuestions?: Array<{title: string; type: string}>;
}

export const buildQuestionGenerationPrompt = ({
    questionCount,
    topic,
    description,
    existingQuestions
}: Props) => {
    const existingQuestionsText = existingQuestions?.length
        ? `\n\nExisting questions:\n${existingQuestions
              .map((q, i) => `${i + 1}. ${q.title} (${q.type})`)
              .join('\n')}`
        : '';
    const topicContext = topic ? `\n\nTopic: ${topic}` : '';
    const descriptionContext = description ? `\n\nContext: ${description}` : '';

    return `You are a survey design expert. Generate ${questionCount} high-quality questions for a survey.${topicContext}${descriptionContext}${existingQuestionsText}

Requirements:
- Vary question types: use a mix of "text", "single_select", and "multi_select"
- Titles must be clear, concise, and professional
- Descriptions are optional, but helpful
- For select questions, provide 3–5 unique and relevant options
- All options must be strings only
- Return an array of valid JSON objects with the following schema:
{
  "title": "Question title",
  "description": "Optional description",
  "type": "text|single_select|multi_select",
  "required": true/false,
  "allowOther": false,
  "randomiseOptionsOrder": false,
  "order": 0,
  "options": [] (for text questions, use empty array; for select questions, use format: ["Option text", "title"]),
}

Example select question:
{
  "title": "Who is your favourite superhero?",
  "description": "Think about your childhood and who you looked up to.",
  "type": "single_select",
  "required": true,
  "allowOther": false,
  "randomiseOptionsOrder": true,
  "order": 0,
  "options": ["Superman", "Batman", "Wonder Woman", "The Flash", "Green Lantern"]
}

Example text question:
{
  "title": "What is your name?",
  "description": "Please enter your full name including middle names.",
  "type": "text",
  "required": true,
}

Rules:
- Return JSON only. No explanation, no markdown, no surrounding text.
- For "text" type questions, leave "options" as an empty array.
- Set "order" based on the order of generation, starting from ${existingQuestions?.length ?? 0}.`;
};

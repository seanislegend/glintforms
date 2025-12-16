interface BuildThemeGenerationPromptProps {
    minimisedAnswers: Array<[number, string]>;
    questionText: string;
    surveyContext: string;
}

export const buildThemeGenerationPrompt = ({
    minimisedAnswers,
    questionText,
    surveyContext
}: BuildThemeGenerationPromptProps) => {
    return `
        Context: ${surveyContext}
        Question: "${questionText}"
        
        Answers (Format: [id, text]):
        \`\`\`json
        ${JSON.stringify(minimisedAnswers)}
        \`\`\`

        Group the provided survey answers into semantic themes with clear, distinct differentiators.
        
        INPUT FORMAT:
        The data is provided as an array of arrays: [ID, ANSWER_TEXT].
        
        RULES:
        1. Use the ID from index 0 to reference answers in your output.
        2. Group by semantic meaning.
        3. Assign every answer to a theme.
        4. Each theme must have clear, distinct characteristics that differentiate it from other themes.
        5. Theme names should be specific and descriptive, highlighting what makes the theme unique.
        6. Theme descriptions must clearly explain the distinguishing features, themes, or patterns that set this theme apart from others.
        7. Avoid generic themes that could overlap with others. If themes are too similar, merge them or refine their differentiators.
        8. Focus on what makes each theme meaningfully different, not just what it contains.
        9. Provide a sentiment for each theme between positive, negative or neutral.
      `;
};


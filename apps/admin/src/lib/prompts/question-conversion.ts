import type {ParsedRow} from '@/utils/parse-import-file';

export const buildQuestionConversionPrompt = (parsedData: ParsedRow[]): string => {
    if (parsedData.length === 0) {
        throw new Error('No data found in the uploaded file.');
    }
    const sampleData = parsedData.slice(0, 3);
    const allColumns = Object.keys(parsedData[0] || {});

    return `You are a survey data conversion expert. I have uploaded a file with survey questions in an unknown format, and I need you to convert it to our standard question format.

Here's the data structure from the uploaded file:
Columns: ${allColumns.join(', ')}

Sample data:
${JSON.stringify(sampleData, null, 2)}

Total rows: ${parsedData.length}

Please convert this data to our standard question format. Our questions have the following structure:
- title: string (required, 2-200 characters)
- description: string (optional, max 1000 characters)
- type: "text" | "number" | "single_select" | "multi_select"
- required: boolean
- allowOther: boolean
- randomiseOptionsOrder: boolean
- options: string[] (empty array for text/number questions, array of option strings for select questions)

Mapping rules:
1. Look for columns that might contain question titles (e.g., "question", "title", "text", "prompt")
2. Look for columns that might contain descriptions (e.g., "description", "help", "context")
3. Look for columns that might indicate question type (e.g., "type", "question_type", "format")
4. Look for columns that might contain options (e.g., "options", "choices", "answers", "option1", "option2", etc.)
5. Look for columns that might indicate if the question is required (e.g., "required", "mandatory", "optional")
6. For select questions, parse options from columns or comma-separated strings

If you cannot map the data to our format, provide detailed errors explaining what's wrong.
If you can map some but not all data, provide warnings for the problematic rows.

Return a JSON object with:
- questions: array of converted questions
- errors: array of error messages (if any)
- warnings: array of warning messages (if any)

Example response:
{
  "questions": [
    {
      "title": "What is your name?",
      "description": "Please enter your full name",
      "type": "text",
      "required": true,
      "allowOther": false,
      "randomiseOptionsOrder": false,
      "options": []
    }
  ],
  "errors": ["Row 5: Missing required title field"],
  "warnings": ["Row 3: Unknown question type 'rating', defaulting to 'text'"]
}`;
};

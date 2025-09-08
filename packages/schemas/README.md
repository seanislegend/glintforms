# @glint/schemas

This package contains Zod validation schemas for the Glint API, specifically for survey response validation.

## Features

- **Dynamic response validation**: Creates validation schemas based on survey question configurations
- **Multiple question types**: Supports text, number, single_select, and multi_select questions
- **Validation rules**: Supports various validation rules like min/max length, email, URL, and selection limits
- **Optional questions**: Handles both required and optional questions appropriately
- **Custom options**: Supports "other" options for select questions

## Usage

```typescript
import {createResponseSchema} from '@glint/schemas';
import type {questions} from '@glint/database';

// get survey questions from database
const surveyQuestions = await db.select().from(questions).where(eq(questions.surveyId, surveyId));

// create validation schema
const responseSchema = createResponseSchema(surveyQuestions);

// validate response data
const validatedData = responseSchema.parse({
    answers: {
        'question-1': 'user answer',
        'question-2': 42,
        'question-3': 'option-id',
        'question-4': ['option-1', 'option-2']
    }
});
```

## Question Types

### Text Questions
- Basic string validation
- Optional validation rules: minLength, maxLength, email, URL

### Number Questions
- Numeric validation
- Optional validation rules: min, max

### Single Select Questions
- Validates against predefined options
- Supports custom "other" values when `allowOther` is enabled

### Multi Select Questions
- Array validation with string elements
- Validates against predefined options
- Supports custom "other" values when `allowOther` is enabled
- Optional validation rules: minSelections, maxSelections

## Validation Rules

The following validation rules are supported:

- `minLength`: Minimum character length for text questions
- `maxLength`: Maximum character length for text questions
- `min`: Minimum value for number questions
- `max`: Maximum value for number questions
- `minSelections`: Minimum number of selections for multi_select questions
- `maxSelections`: Maximum number of selections for multi_select questions
- `email`: Email format validation for text questions
- `url`: URL format validation for text questions

## Development

```bash
# install dependencies
bun install

# run tests
bun test

# run type checking
bun run typecheck

# build package
bun run build
```

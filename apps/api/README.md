# Glint API

A Hono-based API server for the Glint survey platform.

## Development

```bash
# install dependencies
bun install

# start development server
bun run dev

# run type checking
bun run typecheck

# run linting
bun run lint
```

## Testing

The API uses Vitest for unit and integration testing. Tests are located in `src/routes/` and follow the naming convention `*.test.ts`.

### Running Tests

```bash
# run tests in watch mode
bun run test

# run tests once
bun run test:run

# run specific test file
bun run test surveys.test.ts
```

### Test Structure

Tests are organised by route and test both successful and error scenarios:

- **GET /:idOrSlug** - Survey retrieval with various states (open, closed, not found)
- **POST /:idOrSlug/responses** - Response submission with comprehensive validation and error handling

### Mocking Strategy

The test suite uses a **simplified mocking approach** to reduce repetition and make tests easier to maintain:

#### Helper Functions
- `createMockDbSelect()` - Creates mock database select queries
- `createMockDbSelectSimple()` - Creates simple mock database selects
- `createMockDbTransaction()` - Creates mock database transactions
- `setupSurveyMocks()` - Comprehensive mock setup for survey scenarios

#### Predefined Scenarios
Common test scenarios are predefined for easy reuse:

```typescript
// GET scenarios
mockScenarios.openSurvey()           // Open survey with questions
mockScenarios.closedSurvey()         // Closed survey with closed text
mockScenarios.surveyNotFound()       // Survey not found
mockScenarios.passwordProtected()    // Password protected survey
mockScenarios.anonymousAccess()      // Anonymous access enabled
mockScenarios.maxResponsesReached()  // Max responses reached

// POST scenarios  
mockScenarios.successfulResponse()   // Successful response creation
mockScenarios.transactionError()     // Transaction error
mockScenarios.surveyClosed()         // Survey closed error
mockScenarios.inactiveSurvey()       // Inactive survey error
mockScenarios.archivedSurvey()       // Archived survey error
```

#### Benefits
- **No manual mock order tracking** - Helper functions handle the sequence
- **Reduced repetition** - Common patterns are abstracted
- **Clear test intent** - Test scenarios are self-documenting
- **Easy maintenance** - Changes to mock structure only need to be made in one place

### Example Test Pattern

#### Simplified Approach (Recommended)

```typescript
describe('Survey Routes', () => {
    it('should return survey with questions when open', async () => {
        // setup mocks using predefined scenario
        mockScenarios.openSurvey();

        // make request
        const res = await app.request('/surveys/survey-id');

        // assert response
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toEqual({
            allowAnonymous: true,
            description: 'A test survey',
            id: 'survey-id',
            isClosed: false,
            questions: [...],
            slug: 'survey-id',
            title: 'Test Survey'
        });
    });

    it('should create response successfully', async () => {
        // setup mocks using predefined scenario
        mockScenarios.successfulResponse();

        // make request
        const res = await app.request('/surveys/survey-id/responses', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                answers: {'question-id': 'answer'}
            })
        });

        // assert response
        expect(res.status).toBe(201);
        expect(await res.json()).toEqual({ok: true});
    });

    it('should handle survey not found', async () => {
        // setup mocks using predefined scenario
        mockScenarios.surveyNotFound();

        // make request
        const res = await app.request('/surveys/non-existent-id');

        // assert error response
        expect(res.status).toBe(404);
        expect(await res.json()).toEqual({error: 'not_found'});
    });
});
```

#### Custom Mock Setup

```typescript
it('should handle custom scenario', async () => {
    // setup custom mocks
    setupSurveyMocks({
        survey: customSurvey,
        settings: customSettings,
        responseCount: 10,
        questions: customQuestions,
        transactionSuccess: true
    });

    // test implementation...
});
```

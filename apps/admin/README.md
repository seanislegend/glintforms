TODO

- [x] Separate question toolbar for validation vs options
- [x] Add export CSV, XLS etc.
- [x] Add AI generation of questions
- [x] Rename option title to value
- [] Favourite pages
- [] CMD+K actions
- [] pagination for responses
- [x] add tenants for all users

## Scripts

### Generate Test Survey Responses

generates fake responses for testing surveys with realistic data.

```bash
# using npm script
bun run generate-test-responses <surveyId> <numberOfResponses>

# direct execution
bun run scripts/add-survey-test-data.ts <surveyId> <numberOfResponses>
```

example:
```bash
bun run generate-test-responses 123e4567-e89b-12d3-a456-426614174000 50
```

this will generate 50 complete survey responses with fake data based on the survey's questions.

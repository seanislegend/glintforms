# @glint/translations

Deterministic CLI tool for extracting translatable strings from TypeScript/React code.

## Features

- **AST-based parsing**: Reliable extraction using Babel parser
- **Deterministic keys**: Context-aware, hash-based keys (e.g. `admin.layout.abc123`)
- **Type safety**: Auto-generated TypeScript types with JSDoc comments
- **Per-app isolation**: Each app maintains its own translation files
- **CI integration**: Commands designed for CI pipelines with specific exit codes
- **Framework agnostic**: Works with any i18n setup

## Installation

```bash
bun add @glint/translations
```

## Configuration

Create `.translation.config.json` at project root:

```json
{
  "locales": ["en", "fr", "es", "de"],
  "primaryLocale": "en",
  "apps": {
    "admin": {
      "scanPaths": ["apps/admin/src"],
      "localesDir": "apps/admin/locales",
      "typesOutput": "apps/admin/locales/keys.ts"
    },
    "surveys": {
      "scanPaths": ["apps/surveys/src"],
      "localesDir": "apps/surveys/locales",
      "typesOutput": "apps/surveys/locales/keys.ts"
    }
  },
  "exclude": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**"
  ]
}
```

## Usage

### Extract translations

```bash
# extract from all apps
bun translation extract

# extract from specific app
bun translation extract --app admin
```

This will:
1. Parse all files in `scanPaths`
2. Extract `t()` calls with string literals
3. Generate deterministic keys (e.g. `admin.layout.abc123`)
4. Update `source.json` with metadata
5. Generate TypeScript types with JSDoc comments
6. Merge into locale JSON files (preserves existing translations)

### Check completeness

```bash
# check primary locale across all apps
bun translation check --locale en

# check all locales
bun translation check --all

# check specific app only
bun translation check --app admin --all
```

Exit codes:
- `0`: All complete
- `3`: Config error
- `5`: Missing translations

## Integration

### Setup i18n in your app

```typescript
// apps/admin/src/lib/i18n.ts
import { initTranslations, t as tBase } from '@glint/translations';
import type { TranslationKey } from '@/locales/keys';
import enTranslations from '@/locales/en.json';

// initialize with app's translations
initTranslations(enTranslations, 'en');

// typed wrapper
export const t = (keyOrText: TranslationKey | string): string => tBase(keyOrText);
```

### Use in components

```typescript
import { t } from '@/lib/i18n';

export const MyComponent = () => {
  return <h1>{t('Welcome to Glint')}</h1>;
};
```

After running `bun translation extract`, your editor will show:

```typescript
t('Welcome to Glint')
  // ^ Intellisense shows:
  // "Welcome to Glint"
  // @see apps/admin/src/components/MyComponent.tsx:5
```

## Key generation

Keys follow the pattern: `{path}.{hash}`

- **path**: File location context (max 2 segments, camelCased)
- **hash**: First 7 chars of SHA-256 hash of the source text

Examples:
- `layout.d15a085` - from `apps/admin/src/app/layout.tsx`
- `wizard.abc123` - from `apps/surveys/src/components/wizard/step.tsx`
- `settings.profile.xyz789` - from `apps/admin/src/app/settings/profile/page.tsx`

Since translations are scoped per app (each app has its own `locales/` folder), the app name is not included in keys.

Paths are normalized:
- Route groups `(app)` removed
- Dynamic segments `[id]` removed
- Common directories (`src`, `app`, `components`) removed
- Only meaningful path segments included (max 2)

## Supported patterns

### Extracts

```typescript
t('static string')
t("static string")
t(`static string`)
```

### Ignores (with warnings)

```typescript
t(variable)
t(`string with ${interpolation}`)
t(condition ? 'a' : 'b')
```

## File structure

After extraction, each app has:

```
apps/admin/locales/
├── source.json       # canonical source map
├── keys.ts           # TypeScript types
├── en.json           # primary locale
├── fr.json           # translations
├── es.json
└── de.json
```

### source.json

```json
{
  "version": "1.0.0",
  "generated": "2026-01-06T14:46:52.614Z",
  "keys": {
    "layout.d15a085": {
      "text": "Glint - An AI-assisted survey platform",
      "hash": "d15a0857fa...",
      "added": "2026-01-06T14:46:52.614Z",
      "occurrences": [
        { "file": "apps/admin/src/app/layout.tsx", "line": 11 }
      ]
    }
  }
}
```

### keys.ts

```typescript
export interface TranslationKeys {
  /**
   * "Glint - An AI-assisted survey platform"
   * @see apps/admin/src/app/layout.tsx:11
   */
  "layout.d15a085": string;
}

export type TranslationKey = keyof TranslationKeys;
```

## CI integration

```yaml
# .github/workflows/check-translations.yml
name: Check translations

on: [pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Extract translations
        run: bun translation extract
      
      - name: Check completeness
        run: bun translation check --all
```

## Best practices

1. **Run extract before committing**: Ensure `source.json` and `keys.ts` are up to date
2. **Review added keys**: Check that new keys make sense in context
3. **Avoid dynamic strings**: Use `t()` only with static strings
4. **Per-app separation**: Keep admin and frontend translations separate for security and bundle size
5. **Commit all locale files**: Even empty translations should be tracked

## Exit codes

- `0`: Success
- `1`: Parse error
- `2`: Hash collision detected
- `3`: Configuration error
- `5`: Missing translations (check command)

## Development

```bash
# build package
cd packages/translations
bun run build

# watch mode
bun run dev

# run tests
bun test
```

## License

MIT

# Translation System Usage

## Quick Start

### 1. Write code with readable text

```typescript
import { t } from '@/lib/i18n';

export default function MyComponent() {
    return (
        <div>
            <h1>{t('Welcome to Glint')}</h1>
            <button>{t('Save changes')}</button>
        </div>
    );
}
```

### 2. Extract translations

```bash
bun translation extract
```

This will:
- ✅ Scan your codebase for `t()` calls
- ✅ Generate keys like `admin.myComponent.7037f17`
- ✅ Update `locales/source.json` with metadata
- ✅ Generate `locales/keys.ts` with TypeScript types
- ✅ Update all locale files (`en.json`, `fr.json`, etc.)

### 3. Your code keeps working!

The `t()` function accepts **both**:
- ✅ Original text: `t('Welcome to Glint')`
- ✅ Generated keys: `t('admin.myComponent.7037f17')`

No need to change your code after extraction!

## How It Works

### The `t()` function is smart:

```typescript
// Option 1: Use original text (works before and after extraction)
const text = t('Save changes');

// Option 2: Use generated key (better performance, full autocomplete)
const text = t('admin.settings.dd0ae7a');
```

The function:
1. First checks if input is a valid key
2. If not, looks up the key from the original text
3. Returns translated text for current locale
4. Falls back to input text if nothing found

## File Structure

```
project-root/
├── .translation.config.json    # Configuration
├── locales/
│   ├── source.json             # Master metadata
│   ├── keys.ts                 # Generated TypeScript types
│   ├── en.json                 # English (populated by extraction)
│   ├── fr.json                 # French (manual/AI translation)
│   ├── es.json                 # Spanish
│   └── de.json                 # German
└── apps/admin/src/lib/
    └── i18n.ts                 # Translation function
```

## Generated Keys Format

Keys follow the pattern: `{scope}.{path}.{hash}`

**Example:**
```typescript
// File: apps/admin/src/app/surveys/settings/page.tsx
t('Save changes')
// Generates: "admin.surveys.settings.dd0ae7a"
//             ↑      ↑        ↑       ↑
//           scope   path    context  hash
```

### Key Components:
- **Scope**: `admin` (from `apps/admin/`)
- **Path**: `surveys.settings` (from file path)
- **Hash**: `dd0ae7a` (first 7 chars of SHA-256 of text)

## TypeScript Support

### Full Autocomplete

```typescript
// In your IDE, typing t(' will show all available keys with:
// - The original text in JSDoc
// - File location where it was found

t('admin.surveys.settings.dd0ae7a')
// IDE shows:
// "Save changes"
// @see apps/admin/src/app/surveys/settings/page.tsx:42
```

### Type Safety

```typescript
import type { TranslationKey } from '@/locales/keys';

// Type-safe key reference
const key: TranslationKey = 'admin.surveys.settings.dd0ae7a'; ✅
const key: TranslationKey = 'invalid.key'; // ❌ Type error
```

## Commands

### Extract translations
```bash
bun translation extract [--config path]
```

Scans source files and updates translation files.

### Check completeness
```bash
# Check all locales
bun translation check --all

# Check specific locale
bun translation check --locale fr
```

Verifies all keys have translations. Exits with code 5 if incomplete.

## Configuration

`.translation.config.json`:

```json
{
  "locales": ["en", "fr", "es", "de"],
  "primaryLocale": "en",
  "scanPaths": [
    "apps/admin/src",
    "apps/surveys/src",
    "packages/form/src"
  ],
  "localesDir": "locales",
  "typesOutput": "locales/keys.ts",
  "exclude": [
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**"
  ]
}
```

## Translation Workflow

### For Developers

1. Write code with `t('readable text')`
2. Run `bun translation extract`
3. Commit changes (code + locale files)
4. Done! No code changes needed

### For Translators

1. Open `locales/fr.json` (or other locale)
2. Find keys with empty strings: `"admin.surveys.new.abc123": ""`
3. Add translation: `"admin.surveys.new.abc123": "Nouvelle enquête"`
4. Save and commit

### AI Translation (future)

```bash
# Future command (not yet implemented)
bun translation translate --locale fr --provider anthropic
```

Will automatically translate missing strings using AI.

## Best Practices

### ✅ DO

```typescript
// Use literal strings
t('Save changes')
t("Delete item")
t(`Create survey`)

// Use in JSX
<button>{t('Click me')}</button>

// Store in variables
const text = t('Welcome');
```

### ❌ DON'T

```typescript
// Variables (won't be extracted)
const key = 'some.key';
t(key); // ⚠️ Warning logged

// Template literals with expressions (won't be extracted)
t(`Hello ${name}`); // ⚠️ Warning logged

// Dynamic keys (won't be extracted)
t(condition ? 'Yes' : 'No'); // ⚠️ Warning logged
```

## CI Integration

```yaml
# .github/workflows/ci.yml
- name: Extract translations
  run: bun translation extract

- name: Check for uncommitted changes
  run: git diff --exit-code locales/

- name: Check translation completeness
  run: bun translation check --all

- name: Type check
  run: bun run type-check
```

## Troubleshooting

### "Translation not found" warning

This means the text wasn't extracted. Common causes:
- Used a variable instead of literal string
- File not in `scanPaths` config
- File matches `exclude` pattern

**Solution:** Use literal strings and run `bun translation extract`

### Type error with `t()` call

```typescript
// Error: Argument of type 'string' is not assignable to 'TranslationKey'
t('Some text')
```

This is expected before extraction. The function accepts both `string` and `TranslationKey`, so it should work. If not, check your imports.

### Missing translations in production

Check:
1. Did you run `bun translation extract`?
2. Are locale files committed to git?
3. Is `locales/` directory being deployed?
4. Are you importing from the correct path?

## Performance

### Development
- ✅ Use original text: `t('Save changes')` - convenient, works immediately
- Text lookup happens at runtime

### Production
- ✅ Use generated keys: `t('admin.settings.dd0ae7a')` - faster, no lookup needed
- Direct key access, optimal performance

The function handles both efficiently.

## Locales Directory Structure

```
locales/
├── source.json          # DO commit - source of truth
├── keys.ts              # DO commit - TypeScript types
├── en.json              # DO commit - primary locale
├── fr.json              # DO commit - translations
├── es.json              # DO commit - translations
└── de.json              # DO commit - translations
```

**All files should be committed to version control.**

## Example: Complete Workflow

```typescript
// 1. Write component
// apps/admin/src/app/surveys/new/page.tsx
export default function NewSurvey() {
    return (
        <div>
            <h1>{t('Create new survey')}</h1>
            <p>{t('Fill in the details below to create your survey')}</p>
            <button>{t('Save')}</button>
            <button>{t('Cancel')}</button>
        </div>
    );
}

// 2. Run extraction
// $ bun translation extract
// ✓ Parsed 300 files
// ✓ Extracted 4 strings (4 new)
// ✓ Generated TypeScript types

// 3. Check generated files
// locales/en.json now has:
{
    "admin.surveys.new.abc123": "Create new survey",
    "admin.surveys.new.def456": "Fill in the details below to create your survey",
    "admin.surveys.new.ghi789": "Save",
    "admin.surveys.new.jkl012": "Cancel"
}

// 4. Add French translations
// locales/fr.json:
{
    "admin.surveys.new.abc123": "Créer une nouvelle enquête",
    "admin.surveys.new.def456": "Remplissez les détails ci-dessous",
    "admin.surveys.new.ghi789": "Enregistrer",
    "admin.surveys.new.jkl012": "Annuler"
}

// 5. Switch locale
import { setLocale } from '@/lib/i18n';
setLocale('fr'); // Now all t() calls return French

// 6. Component still works without code changes!
```

## Summary

- ✅ Write code with readable text
- ✅ Run extraction when ready
- ✅ Code keeps working (accepts both text and keys)
- ✅ Full TypeScript support
- ✅ Clean diffs in git
- ✅ CI-ready validation
- ✅ No privacy leaks (relative paths only)

Perfect for maintaining multilingual applications! 🌍


# @glint/translations Package Structure

## Overview

The `@glint/translations` package contains everything needed for translation management:
- CLI tools for extraction and validation
- Runtime helpers for using translations in apps
- Locale files with all translations
- Generated TypeScript types

## Directory Structure

```
packages/translations/
├── locales/                    # Translation files
│   ├── source.json            # Master metadata
│   ├── keys.ts                # Generated TypeScript types
│   ├── en.json                # English translations
│   ├── fr.json                # French translations
│   ├── es.json                # Spanish translations
│   └── de.json                # German translations
│
├── src/
│   ├── cli/                   # CLI commands
│   │   ├── index.ts          # CLI entry point
│   │   └── commands/
│   │       ├── extract.ts    # Extract command
│   │       └── check.ts      # Check command
│   │
│   ├── runtime/               # Runtime for apps
│   │   ├── index.ts          # Main export
│   │   └── i18n.ts           # Translation functions
│   │
│   ├── core/                  # Shared core logic
│   │   ├── parser.ts         # AST parser
│   │   ├── keys.ts           # Key generation
│   │   ├── source.ts         # Source file manager
│   │   ├── types.ts          # Type generator
│   │   └── locales.ts        # Locale file manager
│   │
│   ├── config.ts             # Config loader
│   └── types.ts              # TypeScript types
│
├── tests/                     # Unit tests
│   ├── parser.test.ts
│   ├── keys.test.ts
│   ├── source.test.ts
│   ├── types.test.ts
│   └── locales.test.ts
│
├── example/                   # Example usage
│   ├── i18n.ts
│   └── usage.tsx
│
├── package.json
├── tsconfig.json
├── README.md
├── IMPLEMENTATION.md
└── STRUCTURE.md              # This file
```

## Package Exports

### Main Export (Runtime)
```typescript
import { t, setLocale, getLocale, getAvailableLocales, loadLocale } from '@glint/translations';
import type { TranslationKey, TranslationKeys } from '@glint/translations';
```

### CLI Export
```typescript
// Accessed via bin command
bun translation extract
bun translation check --all
```

### Keys Export
```typescript
import type { TranslationKey } from '@glint/translations/keys';
```

## Package.json Configuration

```json
{
  "main": "./dist/runtime/index.js",
  "types": "./dist/runtime/index.d.ts",
  "bin": {
    "translation": "./dist/cli/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/runtime/index.d.ts",
      "default": "./dist/runtime/index.js"
    },
    "./cli": {
      "types": "./dist/cli/index.d.ts",
      "default": "./dist/cli/index.js"
    },
    "./keys": {
      "types": "./locales/keys.ts",
      "default": "./locales/keys.ts"
    }
  }
}
```

## Usage in Apps

### 1. Add dependency
```json
{
  "dependencies": {
    "@glint/translations": "workspace:*"
  }
}
```

### 2. Create wrapper (optional)
```typescript
// apps/admin/src/lib/i18n.ts
export { t, setLocale, getLocale } from '@glint/translations';
export type { TranslationKey } from '@glint/translations';
```

### 3. Use in components
```typescript
import { t } from '@/lib/i18n';

export default function MyComponent() {
    return <h1>{t('Welcome to Glint')}</h1>;
}
```

### 4. Extract translations
```bash
# From project root
bun translation extract
```

This will:
- Scan all configured paths
- Generate keys in `packages/translations/locales/keys.ts`
- Update `packages/translations/locales/source.json`
- Update all locale files in `packages/translations/locales/*.json`

## Configuration

Configuration lives at the project root:

```json
// .translation.config.json
{
  "locales": ["en", "fr", "es", "de"],
  "primaryLocale": "en",
  "scanPaths": [
    "apps/admin/src",
    "apps/surveys/src",
    "packages/form/src"
  ],
  "localesDir": "packages/translations/locales",
  "typesOutput": "packages/translations/locales/keys.ts",
  "exclude": [
    "**/*.test.ts",
    "**/node_modules/**",
    "**/dist/**"
  ]
}
```

## Build Process

```bash
# Build the package
bun run build

# Run tests
bun test

# Type check
tsc --noEmit
```

The build process:
1. Compiles TypeScript from `src/` to `dist/`
2. Separates CLI and runtime builds
3. Generates type declarations
4. Preserves `locales/` directory for imports

## Locales Directory

The `locales/` directory is committed to git and contains:

### source.json
Master metadata file with all keys and their occurrences:
```json
{
  "version": "1.0.0",
  "generated": "2026-01-06T14:00:00Z",
  "keys": {
    "admin.layout.abc123": {
      "text": "Welcome",
      "hash": "abc123...",
      "occurrences": [
        { "file": "apps/admin/src/app/layout.tsx", "line": 10 }
      ],
      "added": "2026-01-06T14:00:00Z"
    }
  }
}
```

### keys.ts
Generated TypeScript types with JSDoc:
```typescript
export interface TranslationKeys {
  /**
   * "Welcome"
   * @see apps/admin/src/app/layout.tsx:10
   */
  "admin.layout.abc123": string;
}

export type TranslationKey = keyof TranslationKeys;
```

### *.json
Locale files with translations:
```json
{
  "admin.layout.abc123": "Welcome"    // en.json
  "admin.layout.abc123": "Bienvenue"  // fr.json
}
```

## Runtime Behavior

### Translation Lookup

The runtime performs a two-step lookup:

1. **Direct key lookup**: Checks if input is a valid translation key
2. **Text-to-key lookup**: If not, tries to find the key from original text
3. **Fallback**: Returns input string if nothing found

This allows both approaches to work:
```typescript
t('Welcome')                    // Works (text lookup)
t('admin.layout.abc123')       // Works (direct key)
```

### Performance

- Direct key lookup: O(1) hash map access
- Text lookup: O(1) reverse map created at initialization
- No runtime overhead for lookups

## Development Workflow

### 1. Developer writes code
```typescript
<h1>{t('Welcome to Glint')}</h1>
```

### 2. Run extraction
```bash
bun translation extract
```

### 3. Check output
- `locales/keys.ts` updated with new types
- `locales/en.json` populated with text
- Other locale files get empty strings

### 4. Add translations
Edit `locales/fr.json`:
```json
{
  "admin.layout.abc123": "Bienvenue à Glint"
}
```

### 5. Validate
```bash
bun translation check --all
```

## CI Integration

```yaml
# .github/workflows/ci.yml
- name: Extract translations
  run: bun translation extract

- name: Check for changes
  run: git diff --exit-code packages/translations/locales/

- name: Validate completeness
  run: bun translation check --all
```

## Benefits of This Structure

✅ **All-in-one package**: CLI + runtime + locales together  
✅ **Type safety**: Generated types available to all apps  
✅ **Version control**: Locales committed with package  
✅ **No duplication**: Single source of truth  
✅ **Clean imports**: Simple `@glint/translations` import  
✅ **Testable**: Unit tests for all components  
✅ **Documented**: Full API documentation  

## Migration Guide

If you had translations elsewhere:

### Before
```
apps/admin/
  └── src/lib/i18n.ts
locales/
  ├── keys.ts
  └── en.json
```

### After
```
packages/translations/
  ├── locales/
  │   ├── keys.ts
  │   └── en.json
  └── src/runtime/
      └── i18n.ts

apps/admin/
  └── src/lib/i18n.ts  # Just re-exports from @glint/translations
```

### Update imports
```typescript
// Before
import { t } from '@/lib/i18n';
import type { TranslationKey } from '@/locales/keys';

// After (still works if you keep the wrapper)
import { t } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';

// Or import directly
import { t } from '@glint/translations';
import type { TranslationKey } from '@glint/translations';
```

## Summary

The translations package is now a complete, self-contained solution:
- ✅ CLI tools for extraction
- ✅ Runtime for apps
- ✅ Locale storage
- ✅ Type generation
- ✅ Full test coverage
- ✅ Comprehensive docs

Everything needed for translation management in one place! 🌍


# @glint/database

A comprehensive database package built with TypeScript and Drizzle ORM. This package provides database schema definitions, migrations, and a Supabase client designed to be used across all apps.

The package uses Drizzle ORM for type-safe database operations and includes automatic migration management.

## Environment Variables

You must set the following environment variables:

- `SUPABASE_URL` - your Supabase project URL
- `SUPABASE_ANON_KEY` - your Supabase anon/public API key

## Example usage

```ts
import { supabase } from '@glint/database'
import { db } from '@glint/database'
import { surveys } from '@glint/database/schema'

// using supabase client
const { data, error } = await supabase
  .from('surveys')
  .select('*')

// using drizzle orm
const allSurveys = await db.select().from(surveys)
```

## Database Schema

The package exports the complete database schema with all tables, relations, and types. Import specific schemas as needed:

```ts
import { surveys, questions, responses } from '@glint/database/schema'
```

## Migrations

Database migrations are automatically managed through Drizzle. Run migrations using the Drizzle CLI:

```bash
bun run db:migrate
``` 
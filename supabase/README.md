# ApplyWise Supabase Schema

This folder contains the source-controlled Supabase database structure for ApplyWise.

## Apply

Use one of these options:

1. Supabase SQL editor: open `supabase/migrations/20260701000000_initial_applywise_schema.sql`, paste it into the SQL editor, and run it.
2. Supabase CLI: run `supabase init` if this repo has not been initialized, link the project with `supabase link --project-ref <project-ref>`, then run `supabase db push`.

## Connect The App

Add your Supabase Project URL and publishable key to `client/.env`.

This is a Vite app, so use `VITE_` prefixes. If Supabase shows Next.js variables like `NEXT_PUBLIC_SUPABASE_URL`, rename them as below:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

For server-side work, add the same URL and a server-safe key to `server/.env`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key_do_not_put_in_client
```

The server auth middleware can use either `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` to validate Supabase sessions. Never put `SUPABASE_SERVICE_ROLE_KEY` in `client/.env` or any frontend file.

## What It Creates

- Public job feed table with support for seeded, Adzuna, imported, and manual jobs.
- User-owned applications table using the approved ApplyWise statuses.
- Reminders, documents, AI artifacts, document suggestions, application activity, and weekly goals.
- Public waitlist signup table that allows inserts without exposing signup data publicly.
- Row-level security policies so private job-search data is owned by the authenticated user.

## Important Integration Note

The current React tracker still includes `Phone Screen` and `Final Round`. The product-approved statuses are:

- Saved
- Applied
- Interview
- Assessment
- Offer
- Rejected
- Withdrawn

Before switching the app from SQLite to Supabase, map `Phone Screen` and `Final Round` into one of the approved statuses or update the UI to match this schema.

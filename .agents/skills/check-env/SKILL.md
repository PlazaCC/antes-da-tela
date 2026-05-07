---
name: check-env
description: Verifies that all required environment variables are present and correctly formatted. Use when setting up the project, debugging connection issues, or before deploying.
disable-model-invocation: true
allowed-tools: Read, Bash
---

Check that all required environment variables are configured for this project.

## Required variables

Read `.env.local` and verify each of these is set (non-empty):

| Variable                              | Used for                                  | Notes                             |
|:--------------------------------------|:------------------------------------------|:----------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`            | Supabase client (client + server)         | Must start with `https://`        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| Supabase anon public key                  | Starts with `eyJ`                 |
| `DATABASE_URL`                        | Drizzle runtime (transaction pooler)      | Port `6543`, `?pgmode=transaction`|
| `DATABASE_URL_UNPOOLED`               | Drizzle migrations (session pooler)       | Port `5432`                       |
| `NEXT_PUBLIC_POSTHOG_TOKEN`           | PostHog analytics (client + server)       | Starts with `phc_`                |
| `NEXT_PUBLIC_POSTHOG_HOST`            | PostHog API host                          | Usually `https://us.i.posthog.com`|
| `RESEND_API_KEY`                      | Email sending via Resend                  | Starts with `re_`                 |

## Sentry (set by wizard, not in `.env.local`)
`SENTRY_AUTH_TOKEN` is stored in `.env.sentry-build-plugin` — verify that file exists if Sentry was configured.

## Steps
1. Read `.env.local` to check which variables are present.
2. Report which variables are missing or appear malformed.
3. For missing variables, explain where to find them:
   - Supabase: Dashboard → Settings → API
   - PostHog: Project settings → Project API key
   - Resend: resend.com → API Keys
   - Database URLs: Supabase → Settings → Database → Connection string

Do NOT print the actual values of secret variables — only confirm present/missing/malformed.

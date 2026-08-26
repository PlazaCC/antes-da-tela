---
paths: .env*, .env.local, .env.example
---

# Environment Variables

## Application

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL for metadataBase / OG links |

## Supabase

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Anon/publishable key for client-side |
| `DATABASE_URL` | Yes | Pooled connection (port 6543) for migrations |
| `DATABASE_URL_UNPOOLED` | Migrations | Direct connection (port 5432) for `drizzle-kit migrate` |
| `DATABASE_PASSWORD` | Yes | Supabase DB password (used in DATABASE_URL) |

## Analytics & Monitoring

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_POSTHOG_TOKEN` | Yes | PostHog project token |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | PostHog host URL |
| `SENTRY_AUTH_TOKEN` | CI only | Sentry auth token (source map upload) |
| `SENTRY_DSN` | Server | Server-side Sentry DSN |
| `SENTRY_TRACES_SAMPLE_RATE` | No | Tracing sample rate (default 0.1) |
| `SENTRY_SEND_DEFAULT_PII` | No | Send PII to Sentry (default false) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client | Client-side Sentry DSN |
| `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | No | Client tracing sample rate (default 0.1) |

## Email

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes | Resend API key |
| `TEST_RESEND_TO` | Dev | Test recipient email |

## AWS S3 (Storage)

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_REGION` | Yes | S3 region |
| `AWS_ACCESS_KEY_ID` | Yes | S3 access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | S3 secret key |
| `AWS_S3_BUCKET` | Yes | S3 bucket name |
| `NEXT_PUBLIC_S3_PUBLIC_URL` | Yes | Public CDN/base URL for S3 assets |

## Vercel/Corepack

| Variable | Required | Description |
|----------|----------|-------------|
| `ENABLE_EXPERIMENTAL_COREPACK` | Vercel | Enables Yarn 4 on Vercel builds |

## Conventions

- Use `.env` for shared defaults (committed), `.env.local` for secrets (gitignored)
- Use `.env.example` to document all required vars — update it when adding new vars
- `NEXT_PUBLIC_*` vars are bundled into client JS — never put secrets there
- `SENTRY_AUTH_TOKEN` must never be committed or prefixed with `NEXT_PUBLIC_`

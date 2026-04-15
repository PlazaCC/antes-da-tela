# Antes da Tela — Project Setup Guide

This document provides the official step-by-step instructions to set up the Antes da Tela project for local development and testing.

---

## Prerequisites

- Node.js 20 or higher
- Yarn 4 (managed via Corepack, no global install required)
- Git
- Accounts for Supabase, PostHog, Resend, and Sentry (all have free tiers)

---

## 1. Install Dependencies

1. Ensure Corepack is enabled:
   ```bash
   corepack enable
   ```
2. Install project dependencies:
   ```bash
   yarn install
   ```

---

## 2. Environment Variables

1. Copy `.env.example` to `.env` (or `.env.local` if you prefer Next.js convention):
   ```bash
   cp .env.example .env
   ```
2. Fill in all required values from your Supabase, PostHog, Resend, and Sentry dashboards:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only):
     - If your deployment or server code needs to perform privileged actions (bypassing RLS, service-role operations), set `SUPABASE_SERVICE_ROLE_KEY` in your server environment only. Never expose this key to the browser or client bundles. When present the project will prefer this key for server-side Supabase clients.
   - `DATABASE_PASSWORD`
   - `DATABASE_URL` and `DATABASE_URL_UNPOOLED`
   - `NEXT_PUBLIC_POSTHOG_TOKEN`
   - `RESEND_API_KEY`
   - `SENTRY_AUTH_TOKEN`

---

## 3. Database Migrations

Run the database migrations to set up the schema:

```bash
yarn drizzle-kit migrate
```

---

## 4. Start the Development Server

Start the Next.js development server:

```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to verify the app is running.

---

## 5. Integration Tests

Test all integrations to ensure correct setup:

- **Supabase:** Sign up or log in. Confirm user creation in the Supabase dashboard.
- **Sentry:** Trigger an error (e.g., throw an error in a route) and verify it appears in Sentry.
- **PostHog:** Navigate the app and confirm pageview events in the PostHog dashboard.
- **Resend:** Use the password recovery or any email feature and confirm delivery in the Resend dashboard.

---

## 6. (Optional) Deploy to Vercel

1. Push your repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add all environment variables in the Vercel dashboard.
4. Deploy.
5. After the first deploy, run migrations against the production database if needed:
   ```bash
   DATABASE_URL_UNPOOLED=<prod-session-uri> yarn drizzle-kit migrate
   ```

---

## Common Commands

- Install dependencies: `yarn install`
- Start dev server: `yarn dev`
- Run migrations: `yarn drizzle-kit migrate`
- Add dependency: `yarn add <package>`
- Remove dependency: `yarn remove <package>`

---

For troubleshooting or advanced configuration, refer to the project README or the official documentation of each integrated service.

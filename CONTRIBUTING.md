# Contributing to Antes da Tela

Thank you for your interest in contributing to Antes da Tela! This guide outlines the contribution workflow, code standards, best practices, and essential information to help you collaborate efficiently and consistently.

---

## Project Overview

Antes da Tela is a platform for publishing, reading, and discussing audiovisual scripts, built with Next.js, Supabase, Drizzle ORM, tRPC, and a modern UI stack. The goal is to validate hypotheses around script consumption, structured feedback demand, and the value of curation.

See [docs/SETUP.md](docs/SETUP.md) for environment setup instructions.

---

## How to Contribute

1. **Fork and clone the repository**
2. **Create a descriptive branch**
   - Use clear names, e.g., `feature/pdf-reader-zoom`, `fix/auth-middleware`
3. **Implement your contribution**
   - Follow the code and architecture standards below
4. **Ensure all tests and lints pass**
   - `yarn lint`
   - `yarn drizzle-kit migrate` (if you change the schema)
5. **Open a Pull Request (PR)**
   - Clearly describe the goal, context, and changes
   - Link relevant issues or RFCs
6. **Wait for review and feedback**

---

## Code and Architecture Standards

- **TypeScript end-to-end**: Use strict typing throughout the codebase.
- **Next.js App Router**: Organize pages and routes under `app/`.
- **tRPC**: Define APIs in `server/api/` and use Zod for validation.
- **Drizzle ORM**: Schemas in `server/db/schema.ts`, queries in `server/db/`.
- **Supabase Auth**: Use `@supabase/ssr` on the server and `createBrowserClient` on the client.
- **UI**: Prioritize shadcn/ui components and follow the project's design standards.
- **Tailwind CSS v3**: Do not use v4 syntax.
- **Zustand**: For simple global state management.
- **PDF.js**: For script rendering and manipulation.
- **Analytics/Error Tracking**: Use PostHog and Sentry as integrated.

See `.agents/rules/` for detailed stack/layer-specific rules.

---

## Best Practices

- **Atomic and descriptive commits**
- **Small, focused Pull Requests**
- **Document decisions and edge cases in the PR**
- **Prefer reusing existing utilities and components**
- **Add explanatory comments to complex code**
- **Include usage examples when creating new components or APIs**

---

## Testing and Integrations

- **Supabase**: Test login/signup and verify in the dashboard.
- **Sentry**: Trigger an error and confirm it is logged.
- **PostHog**: Navigate and validate pageview events.
- **Resend**: Test email sending (e.g., password recovery).

---

## Environment and Dependencies

- **Node.js 20+**
- **Yarn 4 (Berry)** — always use `yarn add`/`yarn remove`
- **Database:** Supabase Postgres (pooler)
- **Migrations:** `yarn drizzle-kit migrate`
- **Deploy:** Vercel (free tier)

---

## Questions and Support

- Check the documentation in `/docs` for technical decisions
- For questions, open an issue or discuss in the PR
- Suggestions for improvements are welcome!

---

## License

UNLICENSED

---

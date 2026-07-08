---
paths: lib/errors.ts, lib/sentry/**/*.ts, trpc/init.ts, app/error.tsx, app/global-error.tsx, sentry.*.config.ts, instrumentation.ts, proxy.ts, app/auth/callback/route.ts
---

# Error Handling & Logging

## AppError class (`lib/errors.ts`)

- Extends `Error` with `code`, `statusCode`, and `publicMessage`
- `publicMessage` is user-facing — use Portuguese for user-visible text
- `internalMessage` (via opts) is developer-facing — defaults to `publicMessage`

```ts
throw new AppError('Erro ao processar.', {
  code: 'PROCESS_ERROR',
  statusCode: 422,
  internalMessage: `Failed to process ${id}: unexpected format`,
})
```

## Client error payload

```ts
type ClientErrorPayload = {
  status: 'error'
  code: string
  message: string
  details?: unknown
  issueId?: string   // Sentry event ID, present on server-side errors
}
```

- `formatErrorForClient(err)` — maps `AppError` to payload; generic fallback in Portuguese
- `handleServerError(err)` — sends to Sentry, returns payload with `issueId`

## Sentry wrappers (`lib/sentry/index.ts`)

- **Never import `@sentry/nextjs` directly** in application code — use `@/lib/sentry`
- `captureException(err, context?)` — wraps Sentry with fallback console.log
- `captureMessage(msg, level?)` — wraps Sentry with fallback
- Both are safe — they catch Sentry failures silently

## tRPC error handling (`trpc/init.ts`)

- **`errorFormatter`** — global handler on `initTRPC`:
  - Captures `INTERNAL_SERVER_ERROR` and errors with a `cause` to Sentry
  - Formats `ZodError` as `zodError` in response data
  - Attaches `clientError` via `formatErrorForClient` for consistent client shape
- **`appErrorMiddleware`** — wraps every procedure:
  - Catches `AppError`, maps `statusCode` → tRPC code, sends to Sentry, rethrows as `TRPCError`
- **`authenticatedProcedure`** — throws `UNAUTHORIZED` if `getUser()` returns null

```ts
// Pattern for service methods:
if (!record) throw new TRPCError({ code: 'NOT_FOUND', message: 'Record not found' })
```

## Error boundaries (Next.js)

- `app/error.tsx` — client-side error boundary, calls `Sentry.captureException(error)`
- `app/global-error.tsx` — root error boundary, calls `Sentry.captureException(error)`

## Sentry configuration files

- `sentry.server.config.ts` — server-side SDK init
- `sentry.edge.config.ts` — edge runtime SDK init
- `instrumentation-client.ts` — client SDK init + `onRouterTransitionStart`
- `instrumentation.ts` — `onRequestError` for request-level error capture

## Conventions

- Throw `TRPCError` in services/routers — never return error objects
- Use `AppError` for business logic errors with public messages
- Use `captureException` from `@/lib/sentry` for manual error reporting
- Use `captureMessage` for operational events (e.g., "OAuth user missing metadata")
- Do NOT log to console in production code — use Sentry wrappers

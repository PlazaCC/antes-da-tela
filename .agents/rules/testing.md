---
paths: test/**/*.test.{ts,tsx}, vitest.config.ts, test/setup.ts, test/mocks/**
---

# Testing Rules (Vitest + Testing Library + MSW)

## Configuration

- `vitest.config.ts` — `globals: true`, `environment: 'jsdom'`
- `test/setup.ts` — auto-imported via `setupFiles`
- Coverage thresholds: 9% lines/functions/branches/statements
- Coverage includes: `components/`, `lib/`, `server/`, `trpc/`
- Coverage excludes: `components/ui/`, `**/*.d.ts`, `**/index.ts`

## Test file placement

- Inside `test/`, mirroring the source structure:
  - `test/components/` for component tests
  - `test/trpc/` for tRPC tests
  - `test/utils/` for utility tests, custom render, test helpers
  - `test/app/` for page-level validation tests
  - `test/e2e/` for integration/E2E tests
- Naming: `*.test.ts` or `*.test.tsx`

## Custom render utility (`test/utils/render.tsx`)

- Wraps components in `QueryClientProvider` with `retry: false`, `refetchOnWindowFocus: false`
- Re-exports all `@testing-library/react` — import from `../utils/render` instead

```tsx
import { render, screen } from '../utils/render'
```

## Mock setup (`test/setup.ts`)

- Mocks `matchMedia` and `ResizeObserver` as jsdom polyfills
- Imports `whatwg-fetch` for fetch support
- Radix UI primitives mocked to reduce overhead:
  - `@radix-ui/react-portal`, `@radix-ui/react-presence`, `@radix-ui/react-focus-scope`
  - `@radix-ui/react-dismissable-layer`, `@radix-ui/react-popover`
- MSW server starts on `beforeAll`, resets on `afterEach`, closes on `afterAll`

## MSW mock server

- `test/mocks/server.ts` — lazy-loads `msw/node` with no-op fallback
- `test/mocks/handlers.ts` — add request handlers here as needed
- Unhandled requests emit a warning to surface missing handlers

## Component testing patterns

```tsx
import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

test('Button renders and triggers onClick', async () => {
  const user = userEvent.setup()
  const handle = vi.fn()
  render(<Button onClick={handle}>Click me</Button>)

  const btn = screen.getByRole('button', { name: /click me/i })
  expect(btn).toBeInTheDocument()
  await user.click(btn)
  expect(handle).toHaveBeenCalledTimes(1)
})
```

- Use `userEvent.setup()` for realistic interactions (not `fireEvent`)
- Prefer `getByRole` over `getByText`/`getByTestId`
- Use `vi.fn()` for callbacks; `vi.spyOn()` for method spies

## Service/tRPC testing

- Inject mock Supabase client with `vi.fn()` stubs
- Expect `TRPCError` for error cases:
  ```ts
  await expect(service.method()).rejects.toThrow(TRPCError)
  ```

## Running tests

- `yarn test` — interactive watch mode
- `yarn test:run` — single run
- `yarn test:coverage` — with coverage report
- `yarn test:ci` — dot reporter for CI

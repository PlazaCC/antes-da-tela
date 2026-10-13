import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // `server-only` throws outside the react-server condition; it is a no-op guard in tests.
    alias: { 'server-only': new URL('./test/mocks/server-only.ts', import.meta.url).pathname },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'test/setup.ts',
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'html'],
      include: ['components/**', 'lib/**', 'server/**', 'trpc/**'],
      exclude: ['components/ui/**', '**/*.d.ts', '**/index.ts'],
      thresholds: {
        lines: 9,
        functions: 9,
        branches: 9,
        statements: 9,
      },
    },
  },
})

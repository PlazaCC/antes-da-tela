import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'test/setup.ts',
    include: ['test/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['components/**', 'lib/**', 'app/**'],
      exclude: ['**/*.d.ts', '**/node_modules/**', '.agents/**', 'docs/**', 'drizzle/**'],
      // coverage thresholds can be enforced in CI using coverage reports
    },
  },
})

import '@testing-library/jest-dom'
import { vi } from 'vitest'
import 'whatwg-fetch'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

// Basic globals/mocks for tests
// Example: mock window.matchMedia if components rely on it
if (typeof (window as any).matchMedia !== 'function') {
  ;(window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// Polyfill ResizeObserver for jsdom (Radix/Popper use it)
if (typeof (window as any).ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe() {
      return null
    }
    unobserve() {
      return null
    }
    disconnect() {
      return null
    }
  }
  ;(window as any).ResizeObserver = ResizeObserver
}

// Start MSW mock server if available (no-op fallback provided in test/mocks/server.ts)
try {
  const { server } = require('./mocks/server')
  // Vitest provides global lifecycle hooks when `globals: true` is set
  // Warn on unhandled requests to help surface missing handlers in tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
} catch {
  // ignore: server may not be present if msw isn't installed yet
}

// Simplify Radix primitives for tests to avoid async presence/portal/focus warnings
try {
  vi.mock('@radix-ui/react-portal', () => {
    const React = require('react')
    return {
      Portal: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    }
  })
  vi.mock('@radix-ui/react-presence', () => {
    const React = require('react')
    return {
      Presence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    }
  })
  vi.mock('@radix-ui/react-focus-scope', () => {
    const React = require('react')
    return {
      FocusScope: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    }
  })
  vi.mock('@radix-ui/react-dismissable-layer', () => {
    const React = require('react')
    return {
      DismissableLayer: ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
    }
  })
  vi.mock('@radix-ui/react-popover', () => {
    const React = require('react')
    return {
      Popover: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
      PopoverContent: ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
    }
  })
} catch {
  // ignore mocking failures in non-vitest environments
}

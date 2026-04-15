/* eslint-disable @typescript-eslint/no-require-imports */
let server
try {
  // Attempt to wire up MSW if installed

  const { setupServer } = require('msw/node')

  const { handlers } = require('./handlers')
  server = setupServer(...(handlers || []))
} catch {
  // Provide a no-op fallback so tests don't fail when msw isn't installed
  server = {
    listen: () => {},
    close: () => {},
    resetHandlers: () => {},
    use: () => {},
  }
}

module.exports = { server }

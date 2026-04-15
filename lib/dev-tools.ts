/**
 * Returns true when developer tooling routes should be exposed.
 * Controlled by NODE_ENV (local dev) or EXPOSE_DEVELOPER_ROUTER=1 (any env).
 */
export function isDevToolsEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.EXPOSE_DEVELOPER_ROUTER === '1'
  )
}

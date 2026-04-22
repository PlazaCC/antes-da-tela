export function getScriptPublishDefaults() {
  return { status: 'published' as const, published_at: new Date().toISOString() }
}

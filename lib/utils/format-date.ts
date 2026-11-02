export function formatPublishedDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "12 de nov." style, for call schedules; null-safe. */
export function formatShortDate(isoString: string | null | undefined): string | null {
  if (!isoString) return null
  return new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** ISO → value for <input type="datetime-local"> (local time, no zone). */
export function toDateTimeLocal(isoString: string | null | undefined): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

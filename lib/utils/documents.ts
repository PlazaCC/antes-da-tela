/**
 * Identity documents required to publish (RFC-005 §3).
 *
 * Storage rule: `number` is normalized — digits only for CPF, uppercase
 * alphanumerics without separators for the others. `country` is ISO 3166-1
 * alpha-2 ('BR' for CPF and CRNM). The full number never leaves the server;
 * the UI only ever sees `maskDocument()`.
 */
import { isCountryCode } from '@/lib/utils/countries'
import { formatCpf, isValidCpf, stripCpf } from '@/lib/utils/cpf'

export const DOCUMENT_TYPES = ['cpf', 'passport', 'crnm', 'foreign_national_id'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  cpf: 'CPF',
  passport: 'Passaporte',
  crnm: 'CRNM (estrangeiro residente no Brasil)',
  foreign_national_id: 'Documento nacional de outro país',
}

/** CPF and CRNM are Brazilian documents; the others need the issuing country. */
export function documentNeedsCountry(type: DocumentType): boolean {
  return type === 'passport' || type === 'foreign_national_id'
}

export function normalizeDocument(type: DocumentType, value: string): string {
  if (type === 'cpf') return stripCpf(value)
  return value.replace(/[^0-9a-z]/gi, '').toUpperCase()
}

const ALNUM_LENGTH: Record<Exclude<DocumentType, 'cpf'>, [number, number]> = {
  passport: [6, 9],
  crnm: [7, 10],
  foreign_national_id: [4, 20],
}

export type DocumentError = { field: 'number' | 'country'; message: string }

/** The first validation problem (pt-BR message), or null when the document is valid. */
export function documentError(type: DocumentType, value: string, country: string): DocumentError | null {
  if (documentNeedsCountry(type) && !isCountryCode(country)) {
    return { field: 'country', message: 'Selecione o país emissor.' }
  }
  const number = normalizeDocument(type, value)
  if (!number) return { field: 'number', message: 'Informe o número do documento.' }
  if (type === 'cpf') return isValidCpf(number) ? null : { field: 'number', message: 'CPF inválido.' }
  const [min, max] = ALNUM_LENGTH[type]
  if (number.length < min || number.length > max) {
    return { field: 'number', message: `Use de ${min} a ${max} letras ou números.` }
  }
  return null
}

/** Country stored for a document: fixed 'BR' for Brazilian documents. */
export function documentCountry(type: DocumentType, country: string): string {
  return documentNeedsCountry(type) ? country : 'BR'
}

/** Display form that hides all but the last characters: `***.***.789-01`, `*****1234`. */
export function maskDocument(type: DocumentType, number: string): string {
  if (type === 'cpf') return `***.***.${formatCpf(number).slice(8)}`
  // Short numbers show fewer characters so most of the document stays hidden.
  const visible = number.slice(number.length >= 8 ? -4 : -2)
  return `${'*'.repeat(Math.max(number.length - visible.length, 3))}${visible}`
}

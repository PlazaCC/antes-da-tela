import { documentError, documentCountry, maskDocument, normalizeDocument } from '@/lib/utils/documents'
import { documentSchema } from '@/lib/validators/document'
import { describe, expect, it } from 'vitest'

describe('identity documents', () => {
  it('normalizes CPF to digits and the others to uppercase alphanumerics', () => {
    expect(normalizeDocument('cpf', '529.982.247-25')).toBe('52998224725')
    expect(normalizeDocument('passport', 'ab 123-456')).toBe('AB123456')
    expect(normalizeDocument('crnm', 'v123456-7')).toBe('V1234567')
  })

  it('validates CPF check digits', () => {
    expect(documentError('cpf', '529.982.247-25', '')).toBeNull()
    expect(documentError('cpf', '529.982.247-26', '')).toEqual({ field: 'number', message: 'CPF inválido.' })
  })

  it('requires a valid issuing country for passport and foreign national id', () => {
    expect(documentError('passport', 'AB123456', '')?.field).toBe('country')
    expect(documentError('passport', 'AB123456', 'XX')?.field).toBe('country')
    expect(documentError('passport', 'AB123456', 'AR')).toBeNull()
    expect(documentError('foreign_national_id', '1234', 'AR')).toBeNull()
  })

  it('enforces length ranges per type', () => {
    expect(documentError('passport', 'AB12', 'AR')?.field).toBe('number')
    expect(documentError('crnm', 'V123', '')?.field).toBe('number')
    expect(documentError('foreign_national_id', '1'.repeat(21), 'AR')?.field).toBe('number')
  })

  it('stores BR for Brazilian documents regardless of the form value', () => {
    expect(documentCountry('cpf', 'AR')).toBe('BR')
    expect(documentCountry('crnm', '')).toBe('BR')
    expect(documentCountry('passport', 'AR')).toBe('AR')
  })

  it('masks all but the last characters', () => {
    expect(maskDocument('cpf', '52998224725')).toBe('***.***.247-25')
    expect(maskDocument('passport', 'AB123456')).toBe('****3456')
    expect(maskDocument('foreign_national_id', '1234')).toBe('***34')
  })

  it('puts schema errors on the right field', () => {
    const result = documentSchema.safeParse({ type: 'passport', number: 'AB123456', country: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['country'])
  })
})

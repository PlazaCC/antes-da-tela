import { validateUUID } from '@/lib/validators/uuid'
import { describe, expect, it } from 'vitest'

describe('UUID Validation', () => {
  it('should accept valid UUIDs', () => {
    const validUUIDs = [
      '550e8400-e29b-41d4-a716-446655440000',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      '00000000-0000-1000-8000-000000000000',
      'FFFFFFFF-FFFF-8FFF-BFFF-FFFFFFFFFFFF',
    ]
    validUUIDs.forEach((uuid) => {
      expect(validateUUID(uuid)).toBe(true)
    })
  })

  it('should reject invalid UUIDs', () => {
    const invalidUUIDs = [
      '550e8400-e29b-41d4-a716', // too short
      'not-a-uuid-at-all',
      '550e8400-e29b-41d4-a716-446655440000-extra', // too long
      '550e8400-e29b-01d4-a716-446655440000', // invalid version (01 instead of 1-8)
      '550e8400-e29b-41d4-0716-446655440000', // invalid variant (0 instead of 8,9,a,b)
      '',
      null as unknown,
    ]
    invalidUUIDs.forEach((uuid) => {
      expect(validateUUID(uuid as string)).toBe(false)
    })
  })

  it('should reject bot-like patterns', () => {
    const botPatterns = ['Mozilla/5.0', '../', 'admin', 'test%20test', '<script>alert(1)</script>']
    botPatterns.forEach((pattern) => {
      expect(validateUUID(pattern)).toBe(false)
    })
  })

  it('should be case-insensitive', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    expect(validateUUID(uuid.toUpperCase())).toBe(true)
    expect(validateUUID(uuid.toLowerCase())).toBe(true)
  })
})

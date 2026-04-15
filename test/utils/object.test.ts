import { removeUndefined } from '@/server/utils/object'
import { describe, expect, it } from 'vitest'

describe('removeUndefined', () => {
  it('removes undefined values and keeps others', () => {
    const input = { a: 1, b: undefined, c: 'x', d: null }
    const out = removeUndefined(input)
    expect(out).toEqual({ a: 1, c: 'x', d: null })
  })
})

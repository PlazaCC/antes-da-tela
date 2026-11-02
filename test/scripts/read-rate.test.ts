import { MIN_READERS_FOR_RATES, readRate } from '@/lib/utils/read-rate'
import { describe, expect, it } from 'vitest'

describe('readRate', () => {
  it('hides the percentage below the minimum number of readers', () => {
    expect(readRate(2, MIN_READERS_FOR_RATES - 1)).toBeNull()
  })

  it('rounds the share of readers', () => {
    expect(readRate(2, 6)).toBe(33)
    expect(readRate(5, 5)).toBe(100)
  })
})

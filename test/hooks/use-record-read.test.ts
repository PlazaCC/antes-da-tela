import { useRecordRead } from '@/lib/hooks/use-record-read'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mutate = vi.fn()
vi.mock('@/trpc/client', () => ({
  useTRPC: () => ({ scripts: { recordRead: { mutationOptions: () => ({}) } } }),
}))
vi.mock('@tanstack/react-query', () => ({ useMutation: () => ({ mutate }) }))

const SCRIPT = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'

describe('useRecordRead', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mutate.mockClear()
  })
  afterEach(() => vi.useRealTimers())

  it('sends only the furthest page once scrolling settles', () => {
    const { result } = renderHook(() => useRecordRead(SCRIPT, true))
    act(() => {
      result.current(1, 90)
      result.current(4, 90)
      result.current(9, 90)
    })
    expect(mutate).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(2000))
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate).toHaveBeenCalledWith({ scriptId: SCRIPT, page: 9, pagesTotal: 90 })
  })

  it('ignores going back to pages already sent', () => {
    const { result } = renderHook(() => useRecordRead(SCRIPT, true))
    act(() => result.current(9, 90))
    act(() => vi.advanceTimersByTime(2000))
    act(() => result.current(3, 90))
    act(() => vi.advanceTimersByTime(2000))
    expect(mutate).toHaveBeenCalledTimes(1)
  })

  it('flushes the pending page on unmount', () => {
    const { result, unmount } = renderHook(() => useRecordRead(SCRIPT, true))
    act(() => result.current(12, 90))
    unmount()
    expect(mutate).toHaveBeenCalledWith({ scriptId: SCRIPT, page: 12, pagesTotal: 90 })
  })

  it('records nothing when disabled (signed out or author)', () => {
    const { result, unmount } = renderHook(() => useRecordRead(SCRIPT, false))
    act(() => result.current(12, 90))
    act(() => vi.advanceTimersByTime(2000))
    unmount()
    expect(mutate).not.toHaveBeenCalled()
  })
})

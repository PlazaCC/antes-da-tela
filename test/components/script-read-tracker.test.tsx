import { ScriptReadTracker } from '@/components/script-page/script-read-tracker'
import { render } from '@testing-library/react'
import posthog from 'posthog-js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('posthog-js', () => ({ default: { capture: vi.fn() } }))

const viewer = { currentPage: 1, totalPages: 0, isDocumentReady: false }
vi.mock('@/components/pdf-viewer', () => ({ usePdfViewer: () => viewer }))

const PROPS = { scriptId: 's1', genre: 'drama', isOwner: false }

function events(name: string) {
  return vi.mocked(posthog.capture).mock.calls.filter(([event]) => event === name)
}

describe('ScriptReadTracker', () => {
  beforeEach(() => {
    vi.mocked(posthog.capture).mockClear()
    Object.assign(viewer, { currentPage: 1, totalPages: 0, isDocumentReady: false })
  })

  it('sends nothing until the PDF is loaded', () => {
    render(<ScriptReadTracker {...PROPS} />)
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('sends script_read_started once the PDF loads', () => {
    Object.assign(viewer, { totalPages: 100, isDocumentReady: true })
    render(<ScriptReadTracker {...PROPS} />)
    expect(events('script_read_started')).toEqual([
      ['script_read_started', { script_id: 's1', genre: 'drama', pages_total: 100, is_owner: false }],
    ])
  })

  it('sends each milestone once, including those skipped over', () => {
    Object.assign(viewer, { totalPages: 100, isDocumentReady: true })
    const { rerender } = render(<ScriptReadTracker {...PROPS} />)
    expect(events('script_read_progress')).toHaveLength(0)

    viewer.currentPage = 30
    rerender(<ScriptReadTracker {...PROPS} />)
    viewer.currentPage = 10 // going back sends nothing new
    rerender(<ScriptReadTracker {...PROPS} />)
    viewer.currentPage = 100 // jump to the end: 50, 75 and 100 at once
    rerender(<ScriptReadTracker {...PROPS} />)

    expect(events('script_read_progress').map(([, props]) => (props as { milestone: number }).milestone)).toEqual([
      25, 50, 75, 100,
    ])
    expect(events('script_read_progress')[0][1]).toEqual({
      script_id: 's1',
      genre: 'drama',
      milestone: 25,
      page: 30,
      pages_total: 100,
      is_owner: false,
    })
  })
})

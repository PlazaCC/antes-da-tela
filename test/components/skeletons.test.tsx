import { render } from '../utils/render'

import { HomeSkeleton, ScriptPageSkeleton, SearchSkeleton } from '@/components/skeletons'

test('HomeSkeleton renders skeleton sections', () => {
  const { container } = render(<HomeSkeleton />)
  expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
})

test('SearchSkeleton renders skeleton results', () => {
  const { container } = render(<SearchSkeleton />)
  expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
})

test('ScriptPageSkeleton renders skeleton layout', () => {
  const { container } = render(<ScriptPageSkeleton />)
  expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)
})

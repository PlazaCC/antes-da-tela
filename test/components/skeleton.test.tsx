import { render } from '../utils/render'

import { Skeleton } from '@/components/ui/skeleton'

test('Skeleton renders placeholder element', () => {
  const { container } = render(<Skeleton />)
  const el = container.querySelector('[data-slot="skeleton"]')
  expect(el).toBeTruthy()
})

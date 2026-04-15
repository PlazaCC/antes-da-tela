import { render } from '../utils/render'

import { Progress } from '@/components/ui/progress'

test('Progress renders indicator with value', () => {
  const { container } = render(<Progress value={60} />)
  const indicator = container.querySelector('[data-slot="progress-indicator"]')
  expect(indicator).toBeTruthy()
  // style width is set via inline style
  expect((indicator as HTMLElement).style.width).toBe('60%')
})

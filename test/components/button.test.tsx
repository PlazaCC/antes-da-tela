import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Button } from '@/components/ui/button'

test('Button renders children and triggers onClick', async () => {
  const user = userEvent.setup()
  const handle = vi.fn()
  render(<Button onClick={handle}>Click me</Button>)

  const btn = screen.getByRole('button', { name: /click me/i })
  expect(btn).toBeInTheDocument()
  await user.click(btn)
  expect(handle).toHaveBeenCalledTimes(1)
})

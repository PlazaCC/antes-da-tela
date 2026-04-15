import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Switch } from '@/components/ui/switch'

test('Switch toggles state', async () => {
  const user = userEvent.setup()
  render(<Switch />)
  const sw = screen.getByRole('switch')
  expect(sw).toBeInTheDocument()
  await user.click(sw)
  // After click, attribute checked should be truthy
  expect(sw).toHaveAttribute('data-state')
})

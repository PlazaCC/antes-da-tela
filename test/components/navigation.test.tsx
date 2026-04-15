import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Navigation } from '@/components/ui/navigation'

test('Navigation renders items and calls onSelect when clicked', async () => {
  const user = userEvent.setup()
  const items = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ]
  const onSelect = vi.fn()
  render(<Navigation items={items} onSelect={onSelect} />)

  expect(screen.getByText('Home')).toBeInTheDocument()
  await user.click(screen.getByText('About'))
  expect(onSelect).toHaveBeenCalledWith(1)
})

import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { ReactionBar } from '@/components/comments/reaction-bar'

test('ReactionBar renders reactions and calls onSelect', async () => {
  const user = userEvent.setup()
  const reactions = [
    { icon: <span>👍</span>, label: 'like', count: 1 },
    { icon: <span>❤️</span>, label: 'love', count: 2 },
  ]
  const onSelect = vi.fn()
  render(<ReactionBar reactions={reactions} onSelect={onSelect} />)
  expect(screen.getByText('1')).toBeInTheDocument()
  await user.click(screen.getByText('2'))
  expect(onSelect).toHaveBeenCalledWith(1)
})

import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { StarRating } from '@/components/ui/star-rating'

test('StarRating renders stars and triggers onChange', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<StarRating value={2} onChange={onChange} />)
  const third = screen.getByLabelText(/2\.5 or 3 stars/i)
  await user.click(third)
  expect(onChange).toHaveBeenCalledWith(expect.closeTo(3, 0))
})

test('StarRating supports keyboard arrows for half-star mode', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<StarRating value={2} onChange={onChange} allowHalf />)
  const first = screen.getByLabelText(/0\.5 or 1 stars/i)

  first.focus()
  await user.keyboard('{ArrowRight}')
  expect(onChange).toHaveBeenNthCalledWith(1, 2.5)

  await user.keyboard('{ArrowLeft}')
  expect(onChange).toHaveBeenNthCalledWith(2, 1.5)
})

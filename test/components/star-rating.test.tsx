import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { StarRating } from '@/components/ui/star-rating'

test('StarRating renders stars and triggers onChange', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<StarRating value={2} onChange={onChange} />)
  const third = screen.getByLabelText(/Avaliar com 3 estrela/i)
  await user.click(third)
  expect(onChange).toHaveBeenCalledWith(3)
})

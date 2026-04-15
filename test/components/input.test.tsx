import { render, screen } from '../utils/render'
// user-event not required in this test

import { Input } from '@/components/ui/input'

test('Input renders and reflects error state', async () => {
  render(<Input placeholder='Name' />)

  const input = screen.getByPlaceholderText('Name')
  expect(input).toBeInTheDocument()

  // Error prop should set aria-invalid
  render(<Input placeholder='Name2' error />)
  const input2 = screen.getByPlaceholderText('Name2')
  expect(input2).toHaveAttribute('aria-invalid', 'true')
})

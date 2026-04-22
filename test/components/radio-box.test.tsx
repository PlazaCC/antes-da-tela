import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { RadioBox } from '@/components/radio-box/radio-box'

test('RadioBox renders label and toggles input', async () => {
  const user = userEvent.setup()
  render(<RadioBox label='Option' name='opt' />)
  const radio = screen.getByRole('radio')
  expect(screen.getByText('Option')).toBeInTheDocument()
  await user.click(radio)
  expect(radio).toBeChecked()
})

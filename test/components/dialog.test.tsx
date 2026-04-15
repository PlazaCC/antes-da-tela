import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

test('Dialog opens and displays title when triggered', async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger asChild>
        <button>Open</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Test Dialog</DialogTitle>
        <div>Body content</div>
      </DialogContent>
    </Dialog>,
  )

  expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
  await user.click(screen.getByText('Open'))
  expect(await screen.findByText('Test Dialog')).toBeInTheDocument()
})

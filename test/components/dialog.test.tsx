import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

test('Dialog opens and displays title when triggered', async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger asChild>
        <button>Open</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogDescription>Test description</DialogDescription>
        <div>Body content</div>
      </DialogContent>
    </Dialog>,
  )

  expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
  await user.click(screen.getByText('Open'))
  expect(await screen.findByText('Test Dialog')).toBeInTheDocument()
})

test('Dialog renders description alongside title', async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger asChild>
        <button>Open</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>My Title</DialogTitle>
        <DialogDescription>Some description text</DialogDescription>
      </DialogContent>
    </Dialog>,
  )

  await user.click(screen.getByText('Open'))
  expect(await screen.findByText('Some description text')).toBeInTheDocument()
})

test('Dialog hides close button when showCloseButton is false', async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger asChild>
        <button>Open</button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>No Close Button</DialogTitle>
        <DialogDescription>Dialog without close button</DialogDescription>
      </DialogContent>
    </Dialog>,
  )

  await user.click(screen.getByText('Open'))
  await screen.findByText('No Close Button')
  expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
})

test('Dialog shows close button by default', async () => {
  const user = userEvent.setup()
  render(
    <Dialog>
      <DialogTrigger asChild>
        <button>Open</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>With Close</DialogTitle>
        <DialogDescription>Dialog with close button</DialogDescription>
      </DialogContent>
    </Dialog>,
  )

  await user.click(screen.getByText('Open'))
  await screen.findByText('With Close')
  expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
})

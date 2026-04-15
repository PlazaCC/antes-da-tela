import React from 'react'
import { render, screen } from '../utils/render'
import userEvent from '@testing-library/user-event'

import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog'

test('Dialog opens and displays title when triggered', async () => {
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
  await userEvent.click(screen.getByText('Open'))
  expect(await screen.findByText('Test Dialog')).toBeInTheDocument()
})

import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

test('Dropdown opens and displays items when triggered', async () => {
  const user = userEvent.setup()
  render(
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>Open</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>First</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  )

  expect(screen.queryByText('First')).not.toBeInTheDocument()
  await user.click(screen.getByText('Open'))
  expect(await screen.findByText('First')).toBeInTheDocument()
})

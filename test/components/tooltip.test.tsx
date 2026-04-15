import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

test('Tooltip shows content on hover', async () => {
  const user = userEvent.setup()
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button>Hover</button>
        </TooltipTrigger>
        <TooltipContent>Tip</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  )

  expect(screen.queryByText('Tip')).not.toBeInTheDocument()
  await user.hover(screen.getByText('Hover'))
  const tips = await screen.findAllByText('Tip')
  expect(tips.length).toBeGreaterThan(0)
})

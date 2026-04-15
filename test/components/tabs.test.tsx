import userEvent from '@testing-library/user-event'
import { render, screen } from '../utils/render'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

test('Tabs switch content when trigger clicked', async () => {
  const user = userEvent.setup()
  render(
    <Tabs defaultValue='one'>
      <TabsList>
        <TabsTrigger value='one'>One</TabsTrigger>
        <TabsTrigger value='two'>Two</TabsTrigger>
      </TabsList>
      <TabsContent value='one'>First</TabsContent>
      <TabsContent value='two'>Second</TabsContent>
    </Tabs>,
  )

  expect(screen.getByText('First')).toBeInTheDocument()
  await user.click(screen.getByText('Two'))
  expect(await screen.findByText('Second')).toBeInTheDocument()
})

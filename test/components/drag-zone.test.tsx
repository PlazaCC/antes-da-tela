import { render, screen } from '../utils/render'

import { DragZone } from '@/components/ui/drag-zone'

test('DragZone renders title and subtitle', () => {
  render(<DragZone title='Upload' subtitle='Click to upload' />)
  expect(screen.getByText('Upload')).toBeInTheDocument()
  expect(screen.getByText('Click to upload')).toBeInTheDocument()
})

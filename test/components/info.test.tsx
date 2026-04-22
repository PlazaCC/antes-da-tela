import { render, screen } from '../utils/render'

import { Info } from '@/components/info/info'

test('Info renders title, description and badge', () => {
  render(<Info title='Title' description='Desc' badge='NEW' />)
  expect(screen.getByText('Title')).toBeInTheDocument()
  expect(screen.getByText('Desc')).toBeInTheDocument()
  expect(screen.getByText('NEW')).toBeInTheDocument()
})

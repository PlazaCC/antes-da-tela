import { render, screen } from '../utils/render'

import { Tag } from '@/components/tag/tag'

test('Tag renders children and variant', () => {
  render(<Tag variant='new'>NEW</Tag>)
  expect(screen.getByText('NEW')).toBeInTheDocument()
})

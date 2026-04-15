import { render, screen } from '../utils/render'

import { Comment } from '@/components/ui/comment'

test('Comment shows author, content and time', () => {
  render(<Comment author='Alice' content='Hello world' time='now' />)
  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Hello world')).toBeInTheDocument()
  expect(screen.getByText('now')).toBeInTheDocument()
})

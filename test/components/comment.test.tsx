import { render, screen } from '../utils/render'

import { Comment } from '@/components/comment/comment'

test('Comment shows author, content and time', () => {
  render(<Comment author='Alice' content='Hello world' time='now' />)
  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('Hello world')).toBeInTheDocument()
  expect(screen.getByText('now')).toBeInTheDocument()
})

test('Comment renders as an article element', () => {
  const { container } = render(<Comment author='Bob' content='Test' time='1h' />)
  expect(container.querySelector('article')).toBeInTheDocument()
})

test('Comment renders avatar slot when src provided', () => {
  const { container } = render(
    <Comment author='Alice' avatar='https://example.com/avatar.jpg' content='Hi' time='now' />,
  )
  // AvatarImage is present in DOM (Radix defers img rendering until load event)
  expect(container.querySelector('[data-slot="avatar"]')).toBeInTheDocument()
})

test('Comment shows initial fallback when no avatar provided', () => {
  render(<Comment author='Alice' content='Hi' time='now' />)
  expect(screen.getByText('A')).toBeInTheDocument()
})

test('Comment renders reply block when reply prop is provided', () => {
  render(<Comment author='Alice' content='Original' time='now' reply='This is a reply' />)
  expect(screen.getByText('This is a reply')).toBeInTheDocument()
  expect(screen.getByText('Reply:')).toBeInTheDocument()
})

test('Comment does not render reply block when reply is absent', () => {
  render(<Comment author='Alice' content='Original' time='now' />)
  expect(screen.queryByText('Reply:')).not.toBeInTheDocument()
})

test('Comment forwards className to article', () => {
  const { container } = render(<Comment author='Alice' content='Hi' time='now' className='custom-cls' />)
  expect(container.querySelector('article')?.classList.contains('custom-cls')).toBe(true)
})

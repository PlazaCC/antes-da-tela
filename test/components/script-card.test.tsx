import { fireEvent, render, screen } from '../utils/render'

import { ScriptCard } from '@/components/script-card/script-card'

test('ScriptCard displays title, author and pages', () => {
  render(<ScriptCard title='My Script' author='Bob' genre='drama' rating={4.5} pages={120} />)
  expect(screen.getByText('My Script')).toBeInTheDocument()
  expect(screen.getByText('por Bob')).toBeInTheDocument()
  expect(screen.getByText('120p')).toBeInTheDocument()
})

test('ScriptCard renders as an anchor when href is provided', () => {
  render(
    <ScriptCard
      title='Link Script'
      author='Bob'
      genre='drama'
      rating={4}
      pages={100}
      href='/scripts/1'
      target='_blank'
      rel='noreferrer'
      aria-label='Script link'
    />,
  )
  const link = screen.getByRole('link', { name: 'Script link' })
  expect(link).toHaveAttribute('href', '/scripts/1')
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noreferrer')
  expect(link).toHaveAttribute('aria-label', 'Script link')
})

test('ScriptCard forwards div attributes and composes click handlers', () => {
  const onPreview = vi.fn()
  const onClick = vi.fn()

  render(
    <ScriptCard
      title='Preview Script'
      author='Bob'
      genre='drama'
      rating={4}
      pages={100}
      onPreview={onPreview}
      onClick={onClick}
      aria-label='Preview card'
    />,
  )

  const card = screen.getByRole('button', { name: 'Preview card' })
  fireEvent.click(card)

  expect(onClick).toHaveBeenCalledOnce()
  expect(onPreview).toHaveBeenCalledOnce()
})

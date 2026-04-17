import { render, screen } from '../utils/render'

import { ScriptCard } from '@/components/ui/script-card'

test('ScriptCard displays title, author and pages', () => {
  render(<ScriptCard title='My Script' author='Bob' genre='drama' rating={4.5} pages={120} />)
  expect(screen.getByText('My Script')).toBeInTheDocument()
  expect(screen.getByText('by Bob')).toBeInTheDocument()
  expect(screen.getByText('120p')).toBeInTheDocument()
})

test('ScriptCard renders as an anchor when href is provided', () => {
  render(<ScriptCard title='Link Script' author='Bob' genre='drama' rating={4} pages={100} href='/scripts/1' />)
  const link = screen.getByRole('link', { name: /link script/i })
  expect(link).toHaveAttribute('href', '/scripts/1')
})

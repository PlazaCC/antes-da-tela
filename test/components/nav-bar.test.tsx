import { render, screen } from '../utils/render'

import { NavBar } from '@/components/ui/nav-bar'

test('NavBar renders brand and navigation', () => {
  const items = [{ label: 'Home', href: '/' }]
  render(<NavBar items={items} />)
  expect(screen.getByText(/ANTES DA TELA/i)).toBeInTheDocument()
  expect(screen.getByText('Home')).toBeInTheDocument()
})

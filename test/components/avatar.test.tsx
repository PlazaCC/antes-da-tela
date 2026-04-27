import { render, screen } from '../utils/render'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Avatar as CustomAvatar } from '@/components/avatar/avatar'

// ── Shadcn Avatar primitive ──────────────────────────────────────────────────

test('Avatar renders image and fallback', () => {
  render(
    <div>
      <Avatar>
        <AvatarImage src='/avatar.png' alt='User' data-testid='avatar-image' />
      </Avatar>
      <Avatar>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>,
  )

  const avatars = document.querySelectorAll('[data-slot="avatar"]')
  expect(avatars.length).toBeGreaterThanOrEqual(2)
  expect(screen.getByText('U')).toBeInTheDocument()
})

// ── Custom Avatar component ──────────────────────────────────────────────────

test('CustomAvatar generates two-letter initials from full name', () => {
  render(<CustomAvatar name='John Doe' />)
  expect(screen.getByText('JD')).toBeInTheDocument()
})

test('CustomAvatar generates single initial for one-word name', () => {
  render(<CustomAvatar name='Alice' />)
  expect(screen.getByText('A')).toBeInTheDocument()
})

test('CustomAvatar shows fallback initials when no src provided', () => {
  render(<CustomAvatar name='Test User' />)
  expect(screen.getByText('TU')).toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})

test('CustomAvatar renders img element when src provided', () => {
  render(<CustomAvatar name='Test User' src='https://example.com/avatar.jpg' />)
  expect(screen.getByAltText('Test User')).toBeInTheDocument()
})

test('CustomAvatar applies size variants via style', () => {
  const { container: sm } = render(<CustomAvatar name='AB' size='sm' />)
  const { container: xl } = render(<CustomAvatar name='AB' size='xl' />)

  const smDiv = sm.firstChild as HTMLElement
  const xlDiv = xl.firstChild as HTMLElement

  expect(smDiv.style.width).toBe('28px')
  expect(xlDiv.style.width).toBe('80px')
})

test('CustomAvatar forwards className', () => {
  const { container } = render(<CustomAvatar name='AB' className='my-custom-class' />)
  expect((container.firstChild as HTMLElement).classList.contains('my-custom-class')).toBe(true)
})

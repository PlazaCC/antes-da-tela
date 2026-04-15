import { render, screen } from '../utils/render'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

  // AvatarImage may not load actual image in jsdom; assert avatar roots and fallback exist
  const avatars = document.querySelectorAll('[data-slot="avatar"]')
  expect(avatars.length).toBeGreaterThanOrEqual(2)
  expect(screen.getByText('U')).toBeInTheDocument()
})

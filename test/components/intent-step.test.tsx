import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { render, screen } from '../utils/render'

import { IntentStep } from '@/components/onboarding/intent-step'

test('IntentStep blocks Continuar until an intent is selected', async () => {
  const user = userEvent.setup()
  const onToggle = vi.fn()
  const onContinue = vi.fn()
  const { rerender } = render(<IntentStep selected={[]} onToggle={onToggle} onContinue={onContinue} isSaving={false} />)

  expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: /Quero interpretar/ }))
  expect(onToggle).toHaveBeenCalledWith('interpreter')

  rerender(<IntentStep selected={['interpreter']} onToggle={onToggle} onContinue={onContinue} isSaving={false} />)
  expect(screen.getByRole('button', { name: /Quero interpretar/ })).toHaveAttribute('aria-pressed', 'true')
  await user.click(screen.getByRole('button', { name: 'Continuar' }))
  expect(onContinue).toHaveBeenCalledOnce()
})

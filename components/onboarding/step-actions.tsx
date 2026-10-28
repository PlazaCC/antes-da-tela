import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StepActionsProps {
  primaryLabel: string
  onPrimary?: () => void
  /** Renders the primary button as a form submit instead of calling onPrimary. */
  submit?: boolean
  disabled?: boolean
  skipLabel?: string
  onSkip?: () => void
  className?: string
}

export function StepActions({ primaryLabel, onPrimary, submit, disabled, skipLabel, onSkip, className }: StepActionsProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Button type={submit ? 'submit' : 'button'} onClick={onPrimary} disabled={disabled} className='h-11 w-full'>
        {primaryLabel}
      </Button>
      {onSkip && (
        <Button type='button' variant='ghost' onClick={onSkip} disabled={disabled} className='h-10 w-full text-text-muted'>
          {skipLabel ?? 'Pular'}
        </Button>
      )}
    </div>
  )
}

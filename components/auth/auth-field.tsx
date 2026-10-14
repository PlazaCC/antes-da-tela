import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type AuthFieldProps = ComponentProps<typeof Input> & { label: string; name: string }

/** Labelled input for the e-mail auth forms. */
export function AuthField({ label, name, className, ...props }: AuthFieldProps) {
  const id = `auth-${name}`
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-text-secondary">
        {label}
      </Label>
      <Input id={id} name={name} className={cn('h-11 text-base', className)} {...props} />
    </div>
  )
}

/** Error message for the e-mail auth forms. */
export function AuthFormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="text-body-small text-state-error">
      {message}
    </p>
  )
}

/** Small text button used for secondary actions (switch mode, resend code). */
export function AuthLinkButton({ className, children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-11 text-text-secondary underline-offset-4 transition-colors hover:text-text-primary hover:underline disabled:opacity-50',
        className,
      )}
      {...props}>
      {/* Font size on the span: tailwind-merge drops text-body-small next to a text-<color> class. */}
      <span className="text-body-small">{children}</span>
    </button>
  )
}

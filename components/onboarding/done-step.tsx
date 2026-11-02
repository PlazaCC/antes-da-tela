import { Button } from '@/components/ui/button'
import type { UserIntent } from '@/lib/constants/preferences'
import Link from 'next/link'

interface DoneStepProps {
  intents: UserIntent[]
  next: string
}

const SHORTCUTS: ReadonlyArray<{ href: string; title: string; description: string; intent?: UserIntent }> = [
  { href: '/feed', title: 'Explorar roteiros', description: 'Leia e avalie roteiros da comunidade.' },
  { href: '/editais', title: 'Editais', description: 'Inscreva roteiros, participe do casting ou vote.' },
  { href: '/publish', title: 'Publicar roteiro', description: 'Receba leituras e feedback.', intent: 'producer' },
  { href: '/profile/edit', title: 'Seu perfil', description: 'Complete ou ajuste quando quiser.' },
]

/** O6 — onboarding done (completion is already saved when this renders). */
export function DoneStep({ intents, next }: DoneStepProps) {
  const shortcuts = SHORTCUTS.filter((item) => !item.intent || intents.includes(item.intent))

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-3'>
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='rounded-sm border border-border-subtle bg-elevated p-4 flex flex-col gap-1 hover:border-text-muted transition-colors'>
            <span className='font-medium text-text-primary'>{item.title}</span>
            <span className='text-body-small text-text-secondary'>{item.description}</span>
          </Link>
        ))}
      </div>
      <Button asChild className='h-11 w-full'>
        <Link href={next}>Continuar</Link>
      </Button>
    </div>
  )
}

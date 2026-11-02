import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatCount } from '@/lib/utils/format-count'
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface SignInToReadProps {
  scriptId: string
  pageCount: number | null
  className?: string
}

/** Shown instead of the PDF to signed-out visitors: reading requires an account. */
export function SignInToRead({
  scriptId,
  pageCount,
  className,
}: SignInToReadProps) {
  const next = encodeURIComponent(`/scripts/${scriptId}`)
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-md flex-col items-center gap-4 px-5 py-16 text-center',
        className
      )}
    >
      <Lock className="h-10 w-10 text-text-muted" />
      <h2 className="font-display text-[24px] leading-[1.2] text-text-primary">
        Entre para ler este roteiro
      </h2>
      <p className="text-body-small text-text-secondary">
        {pageCount
          ? `${formatCount(pageCount, 'página', 'páginas')} esperando por você. `
          : ''}
        Criar uma conta é grátis e libera a leitura, os comentários e as
        avaliações.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button asChild size="lg">
          <Link href={`/auth/sign-up?next=${next}`}>Criar conta</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`/auth/login?next=${next}`}>Já tenho conta</Link>
        </Button>
      </div>
    </div>
  )
}

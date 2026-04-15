import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleAuthButton } from '@/components/google-auth-button'

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Link href="/">
            <Image src="/assets/logo.svg" alt="Antes da Tela" width={83} height={19} priority />
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-heading-2">Criar conta</CardTitle>
            <CardDescription className="text-secondary text-body-default">
              Use sua conta Google para se cadastrar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <GoogleAuthButton label="Cadastrar com Google" />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-body-small text-muted">
          Já tem uma conta?{' '}
          <Link
            href="/auth/login"
            className="text-brand-accent underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}

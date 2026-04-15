import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import { GoogleAuthButton } from '@/components/google-auth-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function LoginPage() {
  return (
    <div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <div className='flex justify-center'>
          <Link href='/'>
            <Image src='/assets/logo.svg' alt='Antes da Tela' width={83} height={19} priority />
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='font-display text-heading-2'>Entrar</CardTitle>
            <CardDescription className='text-secondary text-body-default'>
              Use sua conta Google para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className='h-10 w-full' />}>
              <GoogleAuthButton label='Entrar com Google' />
            </Suspense>
          </CardContent>
        </Card>

        <p className='text-center text-body-small text-muted'>
          Não tem uma conta?{' '}
          <Link href='/auth/sign-up' className='text-brand-accent underline-offset-4 hover:underline'>
            Cadastrar-se
          </Link>
        </p>
      </div>
    </div>
  )
}

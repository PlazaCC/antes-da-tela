# [03] Auth — Autenticação completa e fluxos de sessão

> ClickUp: https://app.clickup.com/t/86agq8yny
> Status: em revisão · Priority: urgent · Depends on: [02] DB Schema

## Contexto

Supabase Auth com `@supabase/ssr`. Sessão gerenciada por cookies via `proxy.ts` (Next.js 16 usa `proxy.ts`, não `middleware.ts`). As telas de auth já existem parcialmente — auditar e completar.

**Arquivos a auditar/completar:**
- `app/auth/sign-up/page.tsx` + `components/sign-up-form.tsx`
- `app/auth/login/page.tsx` + `components/login-form.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/update-password/page.tsx`
- `proxy.ts` + `lib/supabase/proxy.ts` (≠ middleware.ts — este projeto usa Next.js 16)
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

**Arquivos a criar:**
- `server/api/users.ts` — router tRPC para criar perfil após cadastro

**Regras:** `.agents/rules/supabase.md`, `.agents/rules/typescript.md`

---

## Referência de design (Figma)

| Tela | Node ID | Descrição |
|------|---------|-----------|
| Auth/Login | `51:499` | Tela de login final |
| Auth/Cadastro | `51:528` | Tela de cadastro final |

**Tokens de design a usar:**

| Elemento | Tailwind class |
|----------|---------------|
| Fundo da página | `bg-base` |
| Card central | `bg-surface` + `border border-subtle` + `rounded-sm` |
| Input label | `text-secondary font-mono text-label-mono-caps uppercase tracking-wider` |
| Input field | `bg-elevated border-subtle` (estados: `focus:border-default`, `error:border-state-error`) |
| Botão primário | `bg-brand-accent text-primary hover:opacity-90` |
| Link secundário | `text-brand-accent underline-offset-4` |
| Mensagem de erro | `text-state-error text-body-small` |
| Título da tela | `font-display text-heading-2` (DM Serif Display 32px) |
| Subtítulo | `text-secondary text-body-default` |

**Layout:**
- Tela centralizada verticalmente: `min-h-screen flex items-center justify-center`
- Card com padding interno: `p-8` (32px)
- Gap entre campos: `gap-6` (24px)
- Largura máxima do card: `max-w-sm` (384px)

**Componentes do design system a usar:**
- `Input` (com label, placeholder, estado de erro por campo)
- `Button` variant `default` para submit, `ghost` para links secundários
- `Card`, `CardHeader`, `CardContent` para container

---

## Passos de execução

### 1. Atualizar proxy.ts e lib/supabase/proxy.ts

**Atenção: Este projeto usa Next.js 16 com `proxy.ts` em vez de `middleware.ts`.**

`proxy.ts` (raiz do projeto):
```typescript
import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

`lib/supabase/proxy.ts` — proteger apenas `/publicar` e `/minha-conta`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/publicar', '/minha-conta']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = PROTECTED_ROUTES.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### 2. Criar router tRPC de usuários

Criar `server/api/users.ts`:

```typescript
import { eq } from 'drizzle-orm'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const usersRouter = createTRPCRouter({
  createProfile: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      const [user] = await db
        .insert(users)
        .values({ id: input.id, name: input.name, email: input.email })
        .onConflictDoNothing()
        .returning()
      return user
    }),

  getProfile: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, input.id),
      })
      return user ?? null
    }),

  updateProfile: publicProcedure
    .input(z.object({
      id: z.string().uuid(),
      name: z.string().min(2).max(100).optional(),
      bio: z.string().max(500).optional(),
      image: z.string().url().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      const [updated] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning()
      return updated
    }),
})
```

### 3. Registrar router em server/api/root.ts

```typescript
import { createTRPCRouter } from '@/trpc/init'
import { usersRouter } from './users'

export const appRouter = createTRPCRouter({
  users: usersRouter,
})

export type AppRouter = typeof appRouter
```

### 4. Auditar tela de cadastro (components/sign-up-form.tsx)

A tela DEVE:
- Usar React Hook Form com `zodResolver`
- Schema Zod: `name` (min 2), `email` (email válido), `password` (min 8)
- Após `supabase.auth.signUp()` bem-sucedido → chamar `trpc.users.createProfile.mutate()`
- Mostrar erro inline por campo (não apenas global)
- Redirecionar para `/auth/sign-up-success` (verificar email)
- Usar tokens do design system (ver seção de design acima)

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
})

// No componente:
const trpc = useTRPC()
const createProfile = useMutation(trpc.users.createProfile.mutationOptions())

async function onSubmit(data: FormValues) {
  const supabase = createClient()
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: data.name } },
  })
  if (error) { setError('root', { message: error.message }); return }
  if (authData.user) {
    await createProfile.mutateAsync({ id: authData.user.id, name: data.name, email: data.email })
  }
  router.push('/auth/sign-up-success')
}
```

### 5. Auditar tela de login (components/login-form.tsx)

A tela DEVE:
- `supabase.auth.signInWithPassword({ email, password })`
- Usar `useSearchParams()` para ler `redirectTo` (envolver em `<Suspense>` na page)
- Redirecionar para `searchParams.get('redirectTo') ?? '/'` após sucesso
- Mostrar erro inline quando credenciais inválidas
- Usar React Hook Form + zodResolver

```typescript
// app/auth/login/page.tsx — page deve envolver LoginForm em <Suspense>
import { Suspense } from 'react'
import { LoginForm } from '@/components/login-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
```

### 6. Auditar recuperação de senha

`app/auth/forgot-password/page.tsx`:
- `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/auth/update-password' })`
- Mostrar confirmação de envio (não revelar se email existe)

`app/auth/update-password/page.tsx`:
- `supabase.auth.updateUser({ password: newPassword })`
- Requer sessão ativa (link mágico do email)
- Redirecionar para `/` após sucesso

---

## Validação

```bash
yarn build    # zero erros
yarn lint
```

**Fluxo end-to-end (yarn dev):**
- [ ] Cadastro cria usuário no Supabase Auth E registro na tabela `users`
- [ ] Email de confirmação chega (verificar Resend ou Supabase SMTP)
- [ ] Login retorna sessão que persiste após F5
- [ ] `/publicar` redireciona para `/auth/login?redirectTo=/publicar` quando não autenticado
- [ ] Após login, retorna para `/publicar` automaticamente
- [ ] Email de recuperação chega e permite redefinir senha
- [ ] Formulários mostram erros inline por campo (não apenas global)
- [ ] Visual alinhado com Figma: fundo escuro, card bg-surface, inputs com labels em DM Mono

## Checklist de aceite

- [ ] `proxy.ts` + `lib/supabase/proxy.ts` protegem `/publicar` e `/minha-conta`
- [ ] Cadastro cria registro na tabela `users` via tRPC
- [ ] Sessão persiste após refresh (cookie SSR correto)
- [ ] Todos os fluxos de auth (sign-up, login, forgot, update-password) funcionam end-to-end
- [ ] Emails enviados via Resend (verificar no dashboard)
- [ ] `yarn build` passa sem erros de tipo nos novos arquivos
- [ ] Design alinhado: tokens de cor, tipografia e layout corretos

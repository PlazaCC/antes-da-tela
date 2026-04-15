# [03] Auth — Autenticação completa e fluxos de sessão

> ClickUp: https://app.clickup.com/t/86agq8yny
> Status: em revisão · Priority: urgent · Depends on: [02] DB Schema

## Contexto

Supabase Auth com `@supabase/ssr`. Sessão gerenciada por cookies via middleware. As telas de auth já existem parcialmente — auditar e completar.

**Arquivos a auditar/completar:**
- `app/auth/sign-up/page.tsx`
- `app/auth/login/page.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/update-password/page.tsx`
- `middleware.ts`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

**Arquivos a criar:**
- `server/api/users.ts` — router tRPC para criar perfil após cadastro

**Regras:** `.agents/rules/supabase.md`, `.agents/rules/typescript.md`

## Passos de execução

### 1. Auditar e completar middleware.ts

O middleware DEVE atualizar a sessão em TODAS as rotas e proteger rotas autenticadas:

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = ['/publicar', '/minha-conta']

export async function middleware(request: NextRequest) {
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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### 2. Criar router tRPC de usuários

Criar `server/api/users.ts`:

```typescript
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { createTRPCRouter, publicProcedure } from '@/trpc/init'
import { z } from 'zod'

export const usersRouter = createTRPCRouter({
  // Chamado após cadastro Supabase bem-sucedido
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

> Importar `eq` de `drizzle-orm`.

### 3. Registrar router em server/api/root.ts

```typescript
import { createTRPCRouter } from '@/trpc/init'
import { usersRouter } from './users'

export const appRouter = createTRPCRouter({
  users: usersRouter,
  // demais routers serão adicionados aqui
})

export type AppRouter = typeof appRouter
```

### 4. Auditar tela de cadastro (app/auth/sign-up/page.tsx)

A tela DEVE:
- Usar React Hook Form com `zodResolver`
- Schema Zod: `name` (min 2), `email` (email válido), `password` (min 8)
- Após `supabase.auth.signUp()` bem-sucedido → chamar `trpc.users.createProfile.mutate()`
- Mostrar erro inline por campo (não apenas toast)
- Redirecionar para `/auth/sign-up-success` (verificar email)

Padrão de action:

```typescript
'use client'
import { createBrowserClient } from '@/lib/supabase/client'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'

// ...no componente:
const supabase = createBrowserClient()
const trpc = useTRPC()
const createProfile = useMutation(trpc.users.createProfile.mutationOptions())

async function onSubmit(data: FormValues) {
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

### 5. Auditar tela de login (app/auth/login/page.tsx)

A tela DEVE:
- `supabase.auth.signInWithPassword({ email, password })`
- Redirecionar para `searchParams.get('redirectTo') ?? '/'` após sucesso
- Mostrar erro inline quando credenciais inválidas

### 6. Auditar recuperação de senha

`app/auth/forgot-password/page.tsx`:
- `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/auth/update-password' })`
- Mostrar confirmação de envio (não revelar se email existe)

`app/auth/update-password/page.tsx`:
- `supabase.auth.updateUser({ password: newPassword })`
- Requer sessão ativa (link mágico do email)

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

## Checklist de aceite

- [ ] `middleware.ts` protege `/publicar` e `/minha-conta`
- [ ] Cadastro cria registro na tabela `users` via tRPC
- [ ] Sessão persiste após refresh (cookie SSR correto)
- [ ] Todos os fluxos de auth (sign-up, login, forgot, update-password) funcionam end-to-end
- [ ] Emails enviados via Resend (verificar no dashboard)
- [ ] `yarn build` passa sem erros de tipo nos novos arquivos

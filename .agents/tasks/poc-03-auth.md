# [03] Auth — Autenticação completa e fluxos de sessão

> ClickUp: https://app.clickup.com/t/86agq8yny
> Status: em revisão · Priority: urgent · Depends on: [02] DB Schema

## Contexto

Supabase Auth com `@supabase/ssr`. Sessão gerenciada por cookies via `middleware.ts` (padrão Next.js App Router). As telas de auth já existem parcialmente — auditar e completar.

**Arquivos a auditar/completar:**
- `app/auth/login/page.tsx` (sign-up removido — fluxo unificado via Google OAuth)
- `app/auth/forgot-password/page.tsx`
- `app/auth/update-password/page.tsx`
- `middleware.ts` ← **já criado** (session refresh + x-pathname header)
- `app/(authenticated)/layout.tsx` ← **já criado** (auth guard do route group)
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`

**Arquivos a criar:**
- `server/api/users.ts` — tRPC router to create user profile after OAuth signup

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

### 1. middleware.ts + app/(authenticated)/layout.tsx

**Both files are already implemented.** See the source for their contracts:

`proxy.ts` / `lib/supabase/proxy.ts` — session refresh only, no route protection:
- Calls `supabase.auth.getUser()` on every request to rotate the access token.
- Forwards `x-pathname` request header so the layout can read the current path.
- Matcher excludes `_next/static`, `_next/image`, favicon, and static assets.

`app/(authenticated)/layout.tsx` — route-group auth guard:
- Calls `getClaims()` (local JWT read, no network) — safe because middleware already refreshed.
- Redirects to `/auth/login?next=<pathname>` when session is absent.
- Wraps all routes under `app/(authenticated)/` (currently `/publish`; `/account` is next).

**Route protection pattern:**
```
middleware.ts          → refresh session on every request (getUser)
(authenticated)/layout → check session for protected routes  (getClaims + redirect)
auth/callback/route.ts → exchange OAuth code, upsert user, redirect to ?next=
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
- [x] `/publish` redireciona para `/auth/login?next=/publish` quando não autenticado
- [ ] Após login, retorna para `/publish` automaticamente
- [ ] Email de recuperação chega e permite redefinir senha
- [ ] Formulários mostram erros inline por campo (não apenas global)
- [ ] Visual alinhado com Figma: fundo escuro, card bg-surface, inputs com labels em DM Mono

## Checklist de aceite

- [x] `proxy.ts` + `lib/supabase/proxy.ts` refresh session on every request (`getUser`)
- [x] `app/(authenticated)/layout.tsx` guards `/publish` and future `/account`
- [x] `/publish` redirects unauthenticated users to `/auth/login?next=/publish`
- [x] After OAuth login, callback redirects back to `?next=` URL
- [ ] User profile upserted in `users` table via `auth/callback/route.ts` (done via Supabase PostgREST; verify in Supabase dashboard)
- [ ] Session persists after page refresh (cookie SSR correct)
- [ ] `yarn build` passes with zero type errors
- [ ] Design aligned: color tokens, typography, and layout correct

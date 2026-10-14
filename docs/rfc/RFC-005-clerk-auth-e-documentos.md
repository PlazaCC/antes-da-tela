# RFC-005 — Clerk como login principal + documentos de identificação além do CPF

| Campo   | Valor                    |
| :------ | :----------------------- |
| Status  | Em execução — fases 0, 2, 3 e 4 (código) em produção (2026-10-14); falta a Fase 1 e as pendências manuais da Fase 4 |
| Data    | 2026-10-12               |
| Escopo  | Auth, schema `users`, perfil, publicação |

---

## 1. Contexto

### 1.1 Login

Hoje o login é Google OAuth via Supabase Auth (`signInWithOAuth`). O consentimento do Google mostra
**"continuar para `xxxx.supabase.co`"**, porque o redirect URI do OAuth é o domínio do Supabase. Sem
custom domain no Supabase (pago), os usuários veem um domínio desconhecido e acham que é golpe.

Com o Clerk em produção, o fluxo roda em um subdomínio **nosso** (`clerk.<nosso-dominio>` / `accounts.<nosso-dominio>`)
e com credenciais OAuth do Google **nossas**, então a tela do Google mostra "Antes da Tela" e o nosso domínio.

### 1.2 Documentos

A publicação exige CPF (`users.cpf`, validado com dígito verificador). Isso bloqueia autores
estrangeiros ou brasileiros sem CPF à mão (ex.: residentes no exterior).

### 1.3 Problema de privacidade encontrado (corrigir primeiro)

- A policy RLS `Users are publicly readable` (`to public using true`) libera **todas as colunas** de
  `users` para qualquer um com a publishable key — inclusive `cpf`.
- `users.getProfile` é `publicProcedure` e retorna `cpf` para **qualquer** `id`
  (`server/services/users.service.ts:30`).

Ou seja: o CPF de todo autor está exposto publicamente hoje. Isso é dado pessoal sob a LGPD. A parte 2
deste RFC resolve na raiz (documento em tabela separada, RLS só do dono), mas **um hotfix deve sair já**,
independente do Clerk (ver §4, Fase 0).

---

## 2. Parte 1 — Migração para Clerk

### 2.1 Decisões de arquitetura

| Decisão | Escolha | Por quê |
| :------ | :------ | :------ |
| Integração Clerk ↔ Supabase | **Third-Party Auth nativo** (Supabase Dashboard → Authentication → Third-Party Auth → Clerk) | O Supabase valida o JWT de sessão do Clerk direto; RLS continua funcionando. JWT templates estão deprecados. |
| ID do usuário no banco | **Manter `users.id uuid`** e adicionar `users.clerk_id text unique` | Clerk usa IDs `user_xxx` (não-uuid). Trocar o tipo de PK quebraria todas as FKs (`scripts`, `comments`, `ratings`, `follows`, `comment_reactions`…) e os paths no S3 (`{userId}/...`). Uma coluna nova é aditiva e reversível. |
| `auth.uid()` nas policies | Substituir por `(select public.current_user_id())` | `auth.uid()` faz `sub::uuid` — com token do Clerk (`sub = user_xxx`) ele **dá erro**. |
| Criação do registro em `users` | **Webhook do Clerk** (`user.created`/`user.updated`) + fallback lazy no tRPC | O callback `/auth/callback` deixa de existir. Webhook é operação privilegiada legítima (service role). |
| Contas existentes | **Vínculo por e-mail verificado** no primeiro login via Clerk | Mesmo Google → mesmo e-mail. Sem import em massa, sem perda de roteiros/comentários. |
| UI de login | Manter nosso `GoogleAuthButton` usando `useSignIn().authenticateWithRedirect` | Mantém o design atual; `<SignIn />` do Clerk fica como opção se quisermos e-mail/senha depois. |

### 2.2 Função de identidade (SQL — migration custom)

```sql
-- yarn db:generate --custom clerk_identity
create or replace function public.current_user_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select case
    -- Token do Clerk: sub = 'user_...' → resolve pelo clerk_id
    when (auth.jwt() ->> 'sub') like 'user\_%'
      then (select u.id from public.users u where u.clerk_id = auth.jwt() ->> 'sub')
    -- Token legado do Supabase Auth: sub já é o uuid (período de transição)
    else nullif(auth.jwt() ->> 'sub', '')::uuid
  end
$$;
```

- Aceita os **dois** tipos de token → permite deploy sem downtime e rollback.
- Depois do corte, o ramo `else` pode ser removido.
- Todas as policies do `server/db/schema.ts` trocam `auth.uid()` por `(select public.current_user_id())`
  (o `select` envolvendo faz o Postgres avaliar uma vez por query, não por linha).
- As policies de `storage.objects` (`drizzle/0008`, `0009`) usam `auth.uid()::text`. Novos uploads de roteiro vão
  para o S3 (presign em `app/api/upload/presign/route.ts`), mas **o conteúdo antigo continua no Supabase Storage**
  (buckets públicos, leitura não depende de policy). Com o token do Clerk, `auth.uid()` dá erro, então:
  - **Leitura** de arquivos antigos segue funcionando (bucket público).
  - **Remoção** (`ScriptsService.update` ao trocar PDF/áudio/capa, `UsersService.deleteAccount`) passa pelas policies
    de escrita → trocar `auth.uid()::text` por `public.current_user_id()::text` nessas policies na Fase 2.
  - **`lib/hooks/use-avatar-upload.ts` ainda faz upload no bucket `avatars` do Supabase** — migrar para o presign
    do S3 antes da Fase 3 (o upload direto do browser usa a sessão do Supabase, que deixa de existir).
  - As remoções de arquivos substituídos só chamam `supabase.storage.remove`; para chaves do S3 isso não apaga nada
    (arquivos órfãos no S3). Corrigir junto: remover do S3 ou do Supabase conforme a origem do path.
  - Migrar o conteúdo antigo para o S3 é opcional e pode ficar para depois do Clerk.

### 2.3 Mudanças no código

| Arquivo | Mudança |
| :------ | :------ |
| `package.json` | `yarn add @clerk/nextjs @clerk/localizations` (webhook verificado com `verifyWebhook` de `@clerk/nextjs/webhooks`, sem `svix` extra) |
| `app/layout.tsx` | `<ClerkProvider localization={ptBR} appearance={...}>` com tokens do design system |
| `proxy.ts` | `clerkMiddleware()` no lugar de `updateSession` (Next 16 aceita no `proxy.ts`). Manter o header `x-pathname`. |
| `lib/supabase/server.ts` / `client.ts` | `createClient(url, key, { accessToken: async () => (await auth()).getToken() })`; no browser, `session?.getToken()` via `useSession()`. **Com `accessToken`, `supabase.auth.*` deixa de funcionar** — todos os call-sites abaixo precisam migrar. |
| `trpc/init.ts` | `authenticatedProcedure`: `auth()` → `clerkUserId` → `select id from users where clerk_id = ...` → `ctx.user.id` continua sendo o **uuid interno** (services não mudam). Se não achar, fallback: upsert via service role (corrida com o webhook). |
| `app/api/webhooks/clerk/route.ts` (novo) | `user.created`: se existe `users` com mesmo e-mail verificado e `clerk_id is null` → seta `clerk_id`; senão insere. `user.updated`: sincroniza nome/avatar. `user.deleted`: marca `deactivated_at`. Também dispara `user_signed_in` no PostHog (hoje está no callback). |
| `app/auth/login/page.tsx` | `auth()` do Clerk no lugar de `getClaims()` |
| `app/auth/sso-callback/page.tsx` (novo) | `<AuthenticateWithRedirectCallback />` |
| `app/auth/callback/route.ts` | Remover após o corte |
| `lib/hooks/use-google-auth.ts` | `signIn.authenticateWithRedirect({ strategy: 'oauth_google', redirectUrl: '/auth/sso-callback', redirectUrlComplete: next ?? '/feed' })` |
| `lib/hooks/use-logout.ts`, `components/account/deactivate-account-dialog.tsx` | `useClerk().signOut()` |
| `lib/hooks/use-current-user.ts` | `useUser()` + query `users.me` para obter o uuid interno |
| `lib/hooks/use-avatar-upload.ts`, `app/api/upload/presign/route.ts` | Usar o uuid interno (não o id do Clerk) para o prefixo do path |
| `app/(authenticated)/layout.tsx`, `(dashboard)/layout.tsx`, `app/page.tsx`, `app/scripts/[id]/page.tsx`, `components/navbar/navbar.tsx` | `auth()` / `currentUser()` do Clerk |
| `server/api/users.ts` (`isFollowing`) | Usar o uuid interno resolvido, não `claims.sub` |
| `test/e2e/oauth-callback.test.ts`, `test/mocks/*` | Substituir por testes do webhook (vínculo por e-mail, criação, idempotência) e mock de `auth()` |
| `.env.example`, `docs/SETUP.md`, `CLAUDE.md`, `AGENTS.md`, ADR novo | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login`; reescrever a seção "Supabase Auth (SSR)" |

### 2.4 Configuração externa (fora do código)

1. Clerk: criar app, habilitar só Google, ativar a **integração Supabase** (adiciona `role: authenticated` ao token).
2. Clerk **produção**: domínio `antesdatela.com` (CNAMEs `clerk.`/`accounts.` no DNS) — é isso que tira o `supabase.co` da tela.
3. Google Cloud: criar OAuth Client próprio, redirect URI do Clerk, tela de consentimento com nome/logo
   "Antes da Tela" e links de privacidade/termos (`app/(legal)`). Submeter para verificação da marca.
4. Supabase: adicionar Clerk em Third-Party Auth (domínio do Clerk).
5. Clerk: registrar o webhook `https://<dominio>/api/webhooks/clerk` (eventos `user.*`).

Os passos 1 e 4 valem **por instância** do Clerk: a de dev tem domínio próprio (`*.clerk.accounts.dev`),
que também precisa estar no Third-Party Auth do Supabase. Sem isso, o login no Clerk funciona mas o Supabase
recusa o token e o app não resolve o usuário. Passo a passo para dev local (chaves, service role obrigatória,
webhook dispensável): `docs/SETUP.md` → "Clerk (local login)".

---

## 3. Parte 2 — Outros documentos de identificação

### 3.1 Tipos sugeridos

| Tipo (`document_type`) | Para quem | Validação | País |
| :--------------------- | :-------- | :-------- | :--- |
| `cpf` | Brasileiros / residentes | Dígito verificador (já existe em `lib/utils/cpf.ts`) | BR fixo |
| `passport` | Estrangeiros ou brasileiros no exterior | Alfanumérico 6–9, normalizado em maiúsculas | Obrigatório (ISO 3166-1 alfa-2) |
| `crnm` | Estrangeiros residentes no Brasil (Carteira de Registro Nacional Migratório, antigo RNE) | Alfanumérico, normalizado | BR fixo |
| `foreign_national_id` | Documento nacional de outro país (DNI, cédula, etc.) | Alfanumérico 4–20, normalizado | Obrigatório |

**Não recomendo RG**: numeração não é única nacionalmente (varia por estado) e a nova CIN usa o próprio CPF.

Sobre o registro na Biblioteca Nacional (já exigido para publicar): estrangeiros também registram com
passaporte, então os tipos acima conversam com o `bn_registration`.

### 3.2 Modelo de dados

Tabela separada, **não** colunas em `users` — porque `users` é publicamente legível:

```ts
// server/db/schema.ts
export const documentTypeEnum = pgEnum('document_type', ['cpf', 'passport', 'crnm', 'foreign_national_id'])

export const userDocuments = pgTable(
  'user_documents',
  {
    userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    type: documentTypeEnum('type').notNull(),
    // Normalizado: só dígitos (cpf) ou alfanumérico maiúsculo sem separadores (demais)
    number: text('number').notNull(),
    // ISO 3166-1 alfa-2; 'BR' para cpf/crnm
    country: text('country').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('user_documents_type_country_number_unique').on(t.type, t.country, t.number),
    pgPolicy('Owner manages own document', {
      to: 'authenticated', for: 'all',
      using: sql`(select public.current_user_id()) = user_id`,
      withCheck: sql`(select public.current_user_id()) = user_id`,
    }),
    // Sem policy de leitura pública.
  ],
)
```

- Um documento por usuário (PK = `user_id`) é suficiente para o POC; vira 1:N depois se precisar.
- Migração de dados: `insert into user_documents (user_id, type, number, country) select id, 'cpf', cpf, 'BR' from users where cpf is not null;`
  depois `alter table users drop column cpf` (expand → backfill → contract, em migrations separadas).

### 3.3 API e UI

- `lib/utils/documents.ts`: `normalizeDocument(type, value)`, `isValidDocument(type, value, country)`,
  `maskDocument(type, value)` (exibição: `***.***.789-01`, `*****1234`). `cpf.ts` vira um dos validadores.
- Zod: `z.discriminatedUnion('type', [...])` compartilhado entre `lib/validators/profile.ts` e o router.
- tRPC: `users.getMyDocument` (autenticado, retorna **mascarado**) e `users.upsertDocument`.
  `getProfile` deixa de retornar qualquer documento; passa a expor só `hasDocument: boolean` quando `id` é o próprio usuário.
- Erro de unicidade: "Este documento já está cadastrado em outra conta."
- `ScriptsService.assertPublishable`: checa existência em `user_documents`; mensagem "Para publicar, cadastre um documento de identificação no seu perfil."
- `components/publish/publish-page.tsx`: blocker "Cadastre um documento de identificação no seu perfil".
- Form de perfil (`edit-profile-form.tsx`): seletor de tipo (`RadioBox` já existe, ou `yarn dlx shadcn@latest add select`),
  campo de número com máscara por tipo, `Combobox` de país quando `passport`/`foreign_national_id`.
  Extrair para `components/profile/document-field.tsx` (o form já está perto do limite de linhas).

---

## 4. Plano de execução

Cada fase é uma entrega independente, na ordem.

| Fase | Entrega | Risco | Rollback |
| :--- | :------ | :---- | :------- |
| **0 — Hotfix LGPD** ✅ | `drizzle/0014_protect_user_pii.sql`: `cpf` sai do SELECT de `anon`/`authenticated` (grant por coluna); dono lê via RPC `get_my_cpf()`. `getProfile` não retorna mais `cpf`; novo `users.getMyCpf`. **`email` continua legível** (os upserts usam `EXCLUDED.email`) — fecha na Fase 3. | Baixo | Revert |
| **1 — Documentos** | Tabela `user_documents` + backfill do CPF + validadores + UI + guard de publicação. Policies e RPCs usam `(select public.current_user_id())` (o Clerk já está em produção; `auth.uid()` falha com o token do Clerk). | Médio (migração de dados) | Manter `users.cpf` até o "contract" |
| **2 — Base do Clerk (sem trocar login)** ✅ | Migrations `0015`–`0017`: `users.clerk_id`, função `current_user_id()` com dois ramos, todas as policies migradas. Login continua Supabase — a função cobre os dois tokens. | Médio (RLS) — testar cada policy com token real | Migration reversa restaura `auth.uid()` |
| **3 — Corte para o Clerk** ✅ (2026-10-13, #33) | Config externa (§2.4), `@clerk/nextjs`, webhook, `proxy.ts`, clients Supabase com `accessToken`, todos os call-sites. Avatar passa para o S3; remoção de arquivos substituídos apaga do S3 ou do Supabase conforme a origem. Deploy em preview com Clerk dev antes. | Alto | Supabase Google provider continua ligado por ~2 semanas; revert do deploy volta o login antigo, dados intactos |
| **4 — Limpeza** ✅ código e banco (2026-10-14: `0018_clerk_cleanup` aplicada; `@supabase/ssr` removido; `syncClerkUser` revincula pelo e-mail verificado quando o `clerk_id` salvo não existe na instância do Clerk, como em logins com o Clerk dev contra o banco de produção; ADR e rules atualizados). ⏳ Pendências manuais: desligar o Google no Supabase Auth, pedir a exclusão do OAuth Client antigo. ⏳ `drop column users.cpf` fica para depois da Fase 1. | Revogar SELECT de `users.email` (nenhum upsert do cliente usa mais `EXCLUDED.email`; `getAppUser` passa a ler o e-mail do Clerk), ramo legado da função, `@supabase/ssr` (se nada mais usar), desligar Google no Supabase Auth e pedir ao parceiro para excluir o OAuth Client antigo (projeto GCP dele, usado só pelo Supabase Auth), `drop column users.cpf` (depois do backfill da Fase 1), atualizar docs/ADR. Revogar `email` e remover o ramo legado encerram o rollback da Fase 3. | Baixo | — |

### Critérios de aceite

- Tela do Google mostra "Antes da Tela" e domínio próprio; nenhuma menção a `supabase.co`.
- Usuário antigo loga via Clerk e vê seus roteiros, comentários e avaliações (vínculo por e-mail).
- Usuário novo é criado em `users` mesmo se o webhook atrasar.
- Nenhum documento é legível por terceiros (testar com a publishable key sem sessão e com sessão de outro usuário).
- Publicar funciona com CPF, passaporte e CRNM; duplicado é recusado.
- `yarn lint`, `yarn type-check` e testes passando.

---

## 5. Alternativas consideradas

- **Custom domain no Supabase**: resolve o domínio, mas exige plano pago (Pro + add-on).
- **Google Identity Services + `signInWithIdToken`** (botão/One Tap do Google renderizado no nosso domínio,
  token entregue ao Supabase): grátis e muito menor que trocar de provedor, mantém Supabase Auth.
  Desvantagem: só cobre Google; Clerk dá UI pronta, outros provedores, gestão de usuários e MFA.
  Vale prototipar em 1 dia antes da Fase 3 se o custo/esforço do Clerk pesar.

## 6. Questões

Respondidas:
- Domínio: `antesdatela.com` (temos acesso ao DNS). `antesdatela.com.br` redireciona para o `.com` (mantém query string); não usar `.com.br` em webhook/OAuth.
- Google OAuth: o client de produção do Clerk fica num projeto GCP **da Plaza**. O client antigo (projeto do parceiro) segue só para o Supabase Auth até a Fase 4.
- Storage: novos uploads de roteiro vão para o S3; conteúdo antigo continua no Supabase Storage (sem migração por ora).
- CNPJ: fora do escopo.

Em aberto:
1. Queremos oferecer login por e-mail (magic link) além do Google, já que o Clerk dá isso de graça?

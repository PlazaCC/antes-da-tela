# Deploy e ambientes

| Branch | Ambiente | Serviços | Endereço |
| :-- | :-- | :-- | :-- |
| `main` | Produção | Supabase, Clerk (Production), S3 de produção | `www.antesdatela.com` |
| `dev` | Dev (Preview na Vercel) | Supabase de dev, Clerk (Development), S3 de dev | `dev.antesdatela.com.br` (`VERCEL_DEV_DOMAIN`) |
| `feature/*`, `fix/*`, PRs | — | — | **não geram deploy** |

Fluxo: `feature/*` → PR para `dev` → testa no domínio de dev → PR `dev` → `main`.

## Como o deploy acontece

Pelo GitHub Actions (`.github/workflows/deploy.yml`), a cada push em `dev` ou `main`:
`vercel pull` (variáveis do ambiente) → `vercel build` → `vercel deploy --prebuilt`.

A integração Git da Vercel está desligada (`vercel.json` → `git.deploymentEnabled: false`): ela recusa
commits de autores que não são membros do time na Vercel. O deploy pelo token não depende do autor do commit.

Migrações **não** rodam no deploy: aplique com `yarn db:migrate:verbose` no banco do ambiente antes do merge.

## Configuração (uma vez)

**Vercel**
1. Token: *Account Settings → Tokens → Create* (escopo do time `plazas-cc`).
2. IDs: *Project → Settings → General* → **Project ID**; *Team → Settings → General* → **Team ID** (é o `ORG_ID`).
   Alternativa: `npx vercel link` localmente cria `.vercel/project.json` com os dois.
3. *Settings → Environment Variables*: **Production** = chaves de produção; **Preview** = chaves de **dev**,
   restritas à branch `dev`.
4. *Settings → Domains*: `dev.antesdatela.com.br` ligado à branch `dev` (CNAME no Cloudflare em **DNS only**).
5. *Settings → Git → Ignored Build Step*: "Don't build anything" (garante que branches antigas, sem o
   `vercel.json`, também não gerem deploy pela integração Git).

**GitHub**
- O job usa os ambientes do GitHub **`Production`** (branch `main`) e **`Preview`** (branch `dev`).
- Secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` e `SENTRY_AUTH_TOKEN`: no nível do repositório
  (*Settings → Secrets and variables → Actions*) ou repetidos em cada ambiente (*Settings → Environments*).
- Variable (não secret) `VERCEL_DEV_DOMAIN` = `dev.antesdatela.com.br` (o deploy de `dev` é apontado para ele).
- Recomendado: *Environments → Production* com **Required reviewers** e *Deployment branches* = `main`.

## Deploy manual

*Actions → Deploy (Vercel) → Run workflow* na branch desejada (`dev` ou `main`).

## Variáveis por ambiente (Vercel → Settings → Environment Variables)

Cadastre cada uma duas vezes: **Production** (valor de prod) e **Preview → branch `dev`** (valor de dev).

| Variável | Production | Preview (`dev`) | Onde pegar |
| :-- | :-- | :-- | :-- |
| `NEXT_PUBLIC_APP_URL` | `https://www.antesdatela.com` | `https://dev.antesdatela.com.br` | — |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | projeto de prod | projeto de dev | Supabase → Project Settings → API Keys / Data API |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | instância Production | instância Development | Clerk → Configure → API keys |
| `CLERK_WEBHOOK_SIGNING_SECRET` | webhook de prod | webhook de dev | Clerk → Configure → Webhooks |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `_SIGN_UP_URL` | `/auth/login` / `/auth/sign-up` | igual | — |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `NEXT_PUBLIC_S3_PUBLIC_URL` | bucket/IAM de prod | bucket/IAM de dev | AWS → S3 / IAM |
| `NEXT_PUBLIC_POSTHOG_TOKEN` | projeto PostHog de prod | projeto PostHog de dev | PostHog → Project settings → Project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` | igual | — |
| `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` | DSN do projeto de prod | DSN do projeto de dev | Sentry → Settings → Projects → (projeto) → Client Keys (DSN) |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `production` | `dev` | — (marca o ambiente dos eventos) |
| `SENTRY_TRACES_SAMPLE_RATE`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` | `0.1` | `1` (opcional) | — |
| `RESEND_API_KEY` | chave de prod | chave de dev (ou a mesma) | Resend → API Keys |
| `RESEND_FROM_EMAIL` | `Antes da Tela <nao-responda@antesdatela.com>` | `Antes da Tela (dev) <nao-responda@antesdatela.com>` | domínio verificado no Resend |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | `1` | — |

Só locais (não vão para a Vercel): `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `E2E_*`, `TEST_RESEND_TO`.

**Atenção — variáveis "Sensitive":** o build roda no GitHub Actions e recebe as variáveis por `vercel pull`, que **não**
devolve valores marcados como *Sensitive*. Por isso:
- **Nunca** marque `NEXT_PUBLIC_*` como Sensitive: elas entram no código do navegador durante o build e ficariam vazias.
- Segredos de servidor (Clerk, Supabase, AWS, Resend) podem ser Sensitive: a Vercel os injeta em tempo de execução.
- `SENTRY_AUTH_TOKEN` (upload de source maps no build) fica como **secret do GitHub** (repositório), não na Vercel.
- Sentry com **um projeto por ambiente**: `SENTRY_ORG` é variable do repositório; `SENTRY_PROJECT` é variable
  **de cada ambiente do GitHub** (*Environments → Production* = projeto de prod; *Environments → Preview* = projeto de dev).

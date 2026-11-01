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
- Secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`: no nível do repositório
  (*Settings → Secrets and variables → Actions*) ou repetidos em cada ambiente (*Settings → Environments*).
- Variable (não secret) `VERCEL_DEV_DOMAIN` = `dev.antesdatela.com.br` (o deploy de `dev` é apontado para ele).
- Recomendado: *Environments → Production* com **Required reviewers** e *Deployment branches* = `main`.

## Deploy manual

*Actions → Deploy (Vercel) → Run workflow* na branch desejada (`dev` ou `main`).

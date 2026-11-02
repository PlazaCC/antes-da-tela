# Handoff — Onboarding, Intérpretes, Editais, Ambiente de dev e E2E

Estado em 2026-11-02, para continuar numa sessão local do Claude Code (Windows).
Leia junto: `docs/rfc/RFC-006-onboarding-interpretes-editais.md` (plano, decisões, pendências §10),
`docs/DEPLOY.md` (ambientes e deploy) e `e2e/README.md` (testes).

## 1. O que foi feito

| PR | Branch | Destino | Conteúdo |
| :-- | :-- | :-- | :-- |
| #39 | `fix/migracoes-banco-novo` | `dev` | Migração `0003` roda em banco vazio; `yarn db:migrate:verbose` |
| #41 | `feature/deploy-github-actions` | `dev` | Deploy pelo GitHub Actions (dev → Preview, main → Production); Sentry por env |
| #34 | `feature/onboarding` | `dev` | Fase 1 — onboarding, perfil, preferências (migração 0021) |
| #35 | `feature/interpretes` | `feature/onboarding` | Fase 2 — intérpretes, admin, curadoria, e-mail (0022) |
| #36 | `feature/editais` | `feature/interpretes` | Fase 3 — editais, inscrição, personagens (0023) |
| #37 | `feature/casting` | `feature/editais` | Fase 4 — casting, finalistas, escolha do elenco (0024) |
| #38 | `feature/votacao` | `feature/casting` | Fase 5 — voto, link compartilhável, vencedor (0025, 0026) |
| #40 | `feature/e2e-playwright` | `feature/votacao` | Playwright: onboarding, ciclo do edital, integrações |

Os PRs das fases estão **encadeados**: merge na ordem **#41 → #39 → #34 → #35 → #36 → #37 → #38 → #40**,
trocando o destino do seguinte para `dev` a cada merge. Fluxo de branches: `feature/*`/`fix/*` → `dev` → `main`.

## 2. Ambientes (já configurados pelo time)

- **Supabase**: projeto de dev separado. Migrações aplicadas até pelo menos a `0021` + GRANT manual; rodar
  `yarn db:migrate:verbose` para garantir até a `0026`. Produção está na `0020` (nada novo aplicado lá).
- **Clerk**: instância Development (dev) e Production (prod).
- **S3**: bucket e usuário IAM de dev; `interpreters/` fora da leitura pública; CORS com localhost e dev.
- **Vercel**: mesmo projeto; Production = `main` (`www.antesdatela.com`), Preview = branch `dev`
  (`dev.antesdatela.com.br`). Redirecionamentos `.com.br`/`vercel.app` → `www.antesdatela.com` (feito na Vercel;
  regra do Cloudflare desligada). Integração Git desligada via `vercel.json` (no #41).
- **GitHub**: ambientes `Production` (só `main`) e `Preview` (só `dev`); rulesets em `main` e `dev`;
  secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SENTRY_AUTH_TOKEN`; variables
  `VERCEL_DEV_DOMAIN`, `SENTRY_ORG`, `SENTRY_PROJECT` (por ambiente).
- **Sentry** (conta nova): um projeto por ambiente. **PostHog** (pay-as-you-go, limite US$ 0): projetos Prod e Dev,
  região US, sem Session Replay. **Resend** (conta nova da Plaza): domínio `antesdatela.com` (sa-east-1), chaves
  por ambiente.

## 3. Próximo passo: rodar os testes E2E no Windows

```powershell
git fetch origin
git checkout feature/e2e-playwright
git pull
corepack enable                       # se `yarn` não estiver disponível
yarn install
yarn playwright install chromium
copy .env.e2e.example .env.e2e        # preencher E2E_SUPABASE_URL (+ opcionais)
yarn db:migrate:verbose               # confira que mostra o host do banco de DEV
yarn test:e2e
yarn playwright show-report           # relatório com vídeo/trace das falhas
```

Arquivos de ambiente: `.env` / `.env.local` só com valores de **dev** (o `.env.local` tem prioridade — chaves de
produção ficaram em `.env.prod-backup.local`, que não deve ser lido). `.env.e2e` só com variáveis `E2E_*`/Sentry
de leitura (ver `.env.e2e.example`).

**Primeira execução real**: nunca rodou contra serviços de verdade (a sessão anterior era na nuvem, sem chaves).
Espere ajustes de seletores/tempos. Nos testes encadeados de `editais.spec.ts`, olhe o **primeiro** que falhou.

## 4. Pontos de atenção conhecidos

- `drizzle-kit migrate` (0.31) pode parar em "applying migrations..." sem erro → use `yarn db:migrate:verbose`.
- `users` tem SELECT e UPDATE **por coluna** (0014/0018): coluna nova em `users` precisa de GRANT explícito.
- Variáveis `NEXT_PUBLIC_*` na Vercel **não** podem ser *Sensitive* (o build no Actions não as recebe).
- Os deploys de PR na Vercel falhavam antes do Actions; causa não confirmada (provável: Preview usando
  variáveis/banco de prod). O primeiro deploy pelo Actions (merge do #41) mostrará o log real.
- `vercel pull --git-branch` no workflow: conferir no primeiro run.
- Testes E2E: a trava exige `pk_test_` e `E2E_SUPABASE_URL` igual à URL do app; e-mails só vão para
  `*@resend.dev`; uploads ao S3 são interceptados; dados `e2e-*` apagados no teardown.

## 5. Pendências (detalhes no RFC-006 §10)

- Produto/jurídico: texto do termo de imagem/voz; mídia obrigatória por modalidade; antifraude do voto;
  Session Replay (LGPD); fases automáticas por data.
- Design: telas V1–V3 (voto/compartilhar) no Figma; "Editais" na navegação; banner/logos do edital.
- Dev: e-mails de inscrição e de casting; limpeza de arquivos substituídos no S3; `?ref=` no compartilhamento;
  CI do E2E no GitHub Actions; Fase 6 — pagamento (RFC-007).
- Infra: `www.antesdatela.com` com proxy do Cloudflare (aviso da Vercel, opcional); política do bucket de **prod**
  sem leitura pública em `interpreters/`.

## 6. Como pedir à sessão local

> "Leia `docs/HANDOFF.md`. Rode `yarn test:e2e`, analise as falhas pelo relatório do Playwright e corrija os
> testes ou o app. Siga o `CLAUDE.md`; branches `feature/*` ou `fix/*` a partir da `dev`."

# Contexto para agentes — Antes da Tela (POC)

Objetivo: fornecer contexto sucinto e acionável para agentes (Copilot, VS Code assistants) que irão trabalhar ou automatizar tarefas neste repositório.

Resumo rápido

- Projeto: Antes da Tela — POC de plataforma para publicação, leitura e comentário de roteiros em PDF.
- Hipóteses da POC: validar consumo de roteiros, demanda por feedback estruturado, e valor de curadoria.
- Estado: infra e base de app (Next.js + Supabase + Drizzle + tRPC) configuradas; features centrais (upload, viewer PDF, comentários por página, modelos DB) parcialmente faltantes.

Decisões principais (síntese)

- Repositório: single repo Next.js (App Router).
- Deploy recomendado: Vercel (POC), opções documentadas em `docs/rfc/RFC-002-infra-deploy.md`.
- API: tRPC + Zod. DB: Supabase Postgres. ORM: Drizzle. Leitor: pdf.js. Observability: PostHog, Sentry. Email: Resend.

Arquivos e locais-chave (ponto de partida para qualquer task)

- POC canônico: `docs/POC.md`
- ADR principal: `docs/adrs/ADR-001-antes-da-tela.md`
- ADR UI stack: `docs/adrs/ADR-002-ui-stack.md`
- RFCs: `docs/rfc/*.md` (notar que `RFC-002-infra-deploy.md` está **aberta**)
- README / Setup: `README.md`, `docs/SETUP.md`
- Supabase client: `lib/supabase/client.ts`
- Drizzle schema: `server/db/schema.ts` (tabela `users` existe)
- Drizzle config: `drizzle.config.ts`
- Drizzle client: `server/db/index.ts`
- tRPC init: `trpc/init.ts`
- tRPC handler: `app/api/trpc/[trpc]/route.ts`
- App router placeholder: `server/api/root.ts`
- UI primitives / components: `components/ui/*` (18+ componentes — ver lista abaixo)
- Dev integrations page: `app/development/integrations/page.tsx` (Sentry / PostHog / Resend tests)
- Dev component playground: `app/development/components/page.tsx`
- Dev design system page: `app/development/design-system/page.tsx`

Design system — arquivos de referência

- Tokens Figma (canônico): `.agents/design-system.meta.json` — cores, tipografia, espaçamento, componentes, guidelines
- Plano de implementação: `.agents/design-system.plan.md`
- Integração Figma: `.agents/figma.meta.json`
- Guia UI (shadcn/ui): `docs/UI.md`
- Guia Figma: `docs/FIGMA.md`
- Tokens CSS: `app/globals.css` (variáveis HSL em `:root` e `.dark`)
- Tokens Tailwind: `tailwind.config.ts` (keys: `surface`, `elevated`, `brand.*`, `state.*`, etc.)
- Fontes: Inter (sans), DM Serif Display (display), DM Mono (mono) — carregadas em `app/layout.tsx`

Componentes UI disponíveis em `components/ui/`:
avatar, badge, button, card, checkbox, comment, dialog, drag-zone, dropdown-menu, info, input, label, metric-card, nav-bar, navigation, progress, radio-box, reaction-bar, script-card, skeleton, star-rating, switch, tabs, tag, tooltip

Estado de implementação (essencial)

- Implementado:
  - Infra e integrações básicas (cliente Supabase, Drizzle configurado, tRPC handler ativo).
  - Componentes UI iniciais e página de integrações para verificar Sentry/PostHog/Resend.
  - Dependência `pdfjs-dist` já presente em `package.json` (viewer planejado).
- Pendente / Alta prioridade:
  - Modelagem e migrations Drizzle para entidades `scripts`/`script_files`, `comments`, `ratings`, `audio_files`.
  - Upload de arquivos (PDF/audio) integrado com Supabase Storage (política de bucket, upload direto do cliente recomendado).
  - Viewer PDF com `pdf.js` (import dinâmico via `next/dynamic`) e ancoragem de comentários por número de página.
  - Routers tRPC de domínio: `scripts`, `comments`, `uploads`.

Como rodar / comandos úteis

- Requisitos: Node.js >=20, Yarn 4 (Corepack).
- Instalar dependências:
  - `corepack enable`
  - `yarn install`
- Migrations:
  - `yarn drizzle-kit migrate` (uses `DATABASE_URL_UNPOOLED` as documented)
- Dev server:
  - `yarn dev` (Next.js dev)
- Build / Prod:
  - `yarn build` / `yarn start`

Variáveis de ambiente críticas (preencher antes de rodar)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (for migrations)
- `NEXT_PUBLIC_POSTHOG_TOKEN` and optionally `NEXT_PUBLIC_POSTHOG_HOST`
- `RESEND_API_KEY`
- `SENTRY_AUTH_TOKEN`

Notas técnicas e convenções importantes

- Drizzle: `drizzle.config.ts` aponta para `server/db/schema.ts`; use `yarn drizzle-kit generate` para criar migrations antes de `migrate`.
- Supabase: preferir upload direto do cliente para Storage com políticas de bucket autenticadas para evitar timeouts em funções.
- tRPC: está montado via `fetchRequestHandler` em `app/api/trpc/[trpc]/route.ts`; os routers de domínio ainda faltam.
- pdf.js: deve ser carregado dinamicamente no cliente (`next/dynamic`) e renderizar páginas sob demanda para performance em documentos longos.
- Yarn 4 (Berry) é o gerenciador declarado em `package.json` — usar `corepack enable`.

Checklist rápida para agentes antes de criar/alterar código

1. Ler este documento e `docs/POC-STATUS.md` (resumo de estado que existe no repositório).
2. Verificar ADR/RFC correspondentes antes de propor mudanças (`docs/adrs/`, `docs/rfc/`).
3. Se for mexer em DB, editar `server/db/schema.ts` e gerar migration (`yarn drizzle-kit generate`) — não aplique migrations sem revisar `DATABASE_URL_UNPOOLED`.
4. Para upload de arquivos, preferir implementar upload direto cliente → Supabase Storage; só criar endpoint server-side se houver necessidade de processamento.

- Links rápidos
- POC canônico: `docs/POC.md`
- ADR principal: `docs/adrs/ADR-001-antes-da-tela.md`
- Setup: `docs/SETUP.md`
- Dev integrations: `app/development/integrations/page.tsx`

Próximo passo que posso executar (se autorizado)

- Gerar um esqueleto de routers tRPC (`server/api/scripts.ts`, `server/api/comments.ts`) e um modelo Drizzle inicial para `scripts` e `comments` (sem aplicar migrations). Pergunte se devo prosseguir.

---

Documento gerado automaticamente em 2026-04-14 por agente — mantenha sincronizado com ADRs e RFCs.

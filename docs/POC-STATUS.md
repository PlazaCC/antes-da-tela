# Estado de Implementação — POC "Antes da Tela" (2026-04-14)

Este documento resume o estado atual do repositório em relação à POC original "Antes da Tela" e aponta próximos passos prioritários.

## Resumo rápido

- **Stack adotada (conforme ADR-001 / RFC-001):** Next.js (App Router), Supabase, Drizzle, tRPC, pdf.js (planejado), PostHog, Sentry, Resend.
- **Componentes infra/integrações presentes:** `lib/supabase/client.ts`, `drizzle.config.ts`, `server/db/schema.ts` (tabela `users`), handler tRPC (`app/api/trpc/[trpc]/route.ts`), páginas de verificação em `app/development` (Sentry / Resend / PostHog).
- **UI disponível:** Design system completo com 18+ componentes (ver lista abaixo).
- **Dependências detectadas:** `pdfjs-dist` em `yarn.lock`, indicando intenções de usar `pdf.js`.

## O que está implementado hoje

- Autenticação Supabase (cliente) e hooks de exemplo.
- Conexão Drizzle configurada (client + schema) e tabela `users` criada no schema inicial.
- tRPC inicializado com fetch handler e superjson transformer; `server/api/root.ts` existe como ponto de montagem.
- Páginas de desenvolvimento para testar integrações: Sentry, Resend e PostHog (`app/development/integrations`).
- **Design system implementado (`feat/design-system`):**
  - Tokens de cor, tipografia e espaçamento definidos em `app/globals.css` (CSS vars HSL) e `tailwind.config.ts`
  - Fontes Google: Inter (sans), DM Serif Display (display), DM Mono (mono) via `next/font`
  - Tema dark por padrão (`<html class="dark">`) com `ThemeProvider`
  - 18+ componentes em `components/ui/`: avatar, badge, button, card, checkbox, comment, dialog, drag-zone, dropdown-menu, info, input, label, metric-card, nav-bar, navigation, progress, radio-box, reaction-bar, script-card, skeleton, star-rating, switch, tabs, tag, tooltip
  - Playground de componentes em `app/development/components/page.tsx`
  - Showcase de design system em `app/development/design-system/page.tsx`
  - Metadados Figma em `.agents/design-system.meta.json` e `.agents/figma.meta.json`

## Componentes/funcionalidades listadas na POC mas ainda pendentes

1. Upload de PDF para Supabase Storage (fluxo client-side ou endpoint seguro).
2. Leitor de PDF funcional baseado em `pdf.js` com import dinâmico e performance otimizada para documentos longos.
3. Comentários por página (tabelas + APIs + UI de ancoragem por número de página).
4. Modelagem completa do banco: tabelas `scripts`/`roteiros`, `script_files`, `comments`, `ratings`, `audio_files`.
5. Routers tRPC de domínio (`scripts`, `comments`, `uploads`) e endpoints de integração/validação.
6. Player de áudio e suporte a upload/streaming de áudio.

## Recomendações imediatas (prioridade alta)

- Definir e adicionar o schema Drizzle para `scripts` e `comments`, então gerar migrations (`yarn drizzle-kit generate`).
- Implementar fluxo de upload para Supabase Storage (recomenda upload direto do cliente com políticas de bucket autenticadas; alternativa: endpoint com octetInputParser para uploads via tRPC).
- Implementar viewer básico com `pdfjs-dist` via import dinâmico (`next/dynamic`) e testar render em documentos longos (página por demanda).
- Criar routers tRPC e testes end-to-end mínimos para `scripts` e `comments`.
- Fechar RFC-002 (infra) com decisão de deploy (Vercel recomendado para POC) e registrar um ADR se necessário.

## Links úteis

- POC canônico: `docs/POC.md`
- ADR principal: [docs/adrs/ADR-001-antes-da-tela.md](docs/adrs/ADR-001-antes-da-tela.md)
- Drizzle schema: `server/db/schema.ts`
- tRPC handler: `app/api/trpc/[trpc]/route.ts`
- UI components: `components/ui/script-card.tsx`, `components/ui/drag-zone.tsx`

---

> Se desejar, posso aplicar as mudanças de schema (drizzle) e esboçar os routers tRPC básicos e o viewer de PDF em seguida. Quer que eu prossiga com implementações automáticas ou prefere revisar as recomendações primeiro?

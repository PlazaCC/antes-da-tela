# RFC-001 — Stack técnica da POC

| Campo                  | Valor                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Tipo**               | RFC — Request for Comments                                                            |
| **Status**             | Fechado — decisão registrada na ADR-001                                               |
| **Data**               | 11/04/2026                                                                            |
| **Autor**              | Plaza Creative Collective                                                             |
| **Decisão resultante** | [ADR-001 — Arquitetura da plataforma Antes da Tela](../adrs/ADR-001-antes-da-tela.md) |

---

## Problema

A POC do Antes da Tela precisa de uma stack técnica completa para entregar as funcionalidades essenciais: leitor de PDF com comentários por página, autenticação, publicação de roteiros e descoberta de conteúdo.

A questão central é: **qual combinação de tecnologias permite entregar a POC com velocidade máxima, custo zero e sem acumular dívida técnica que impeça escala futura?**

---

## Restrições

- Time pequeno sem especialização em DevOps ou infraestrutura
- Orçamento operacional inicial: zero
- Linguagem base: TypeScript em todo o projeto
- Prazo para POC funcional: semanas, não meses
- Funcionalidades obrigatórias: leitor de PDF, comentários por página, auth, upload de roteiros
- Preferência por soluções com baixo lock-in no dado (banco relacional)

---

## Decisões em aberto

Este RFC cobre cinco camadas de decisão independentes:

1. Framework web e estratégia de renderização
2. Camada de API e contrato de dados
3. Backend e banco de dados
4. Leitor de PDF
5. Estrutura de repositório

---

## 1. Framework web

### Opção A — Next.js 14 com App Router

SSR nativo, server components, middleware de auth integrado, deploy trivial na Vercel. Ecossistema mais maduro para React em 2026.

### Opção B — Remix

SSR nativo, model de dados baseado em loaders/actions, boa DX. Menor ecossistema, menos material de referência.

### Opção C — Vite + React SPA

Simples, rápido de configurar. Sem SSR — SEO das páginas de roteiro dependeria de soluções extras. Incompatível com a necessidade de renderização server-side para descoberta orgânica.

**Recomendação:** Opção A. SSR é necessário para SEO das páginas de roteiro. Next.js tem o ecossistema mais amplo e integração nativa com os demais componentes da stack.

---

## 2. Camada de API

### Opção A — tRPC

RPC tipado end-to-end dentro do mesmo repositório. O tipo do router vira automaticamente o tipo do cliente — sem schema manual, sem geração de código. Integra nativamente com Zod e TanStack Query.

### Opção B — REST com Next.js API Routes

Familiar, sem dependência adicional. Requer manutenção manual de tipos entre cliente e servidor. Propenso a desincronização de contrato.

### Opção C — GraphQL com Pothos

Flexível, bom para APIs públicas consumidas por terceiros. Complexidade desproporcional para uma POC com um único consumidor (o próprio frontend).

### Opção D — Hono

Router leve e edge-ready. Faz mais sentido quando a API precisa existir como serviço separado do Next.js — não é o caso aqui.

**Recomendação:** Opção A. A tipagem end-to-end do tRPC elimina uma categoria inteira de bugs de contrato. Para um time pequeno num monorepo, o ganho é imediato e sem custo de configuração.

---

## 3. Backend e banco de dados

### Opção A — BaaS: Supabase

Postgres real com auth, storage e realtime nativos num único serviço. Free tier de 500 MB. ORM gerenciado pelo Drizzle no lado da aplicação — banco migrável independentemente do Supabase.

Detalhado no RFC-001-modelo-backend (renomeado para RFC-003 após reorganização).

### Opção B — Serviços compostos

Neon + Clerk + Cloudflare R2 + Ably. Mais flexível por camada, porém quatro integrações para configurar antes de escrever uma linha de produto.

### Opção C — Backend Node.js próprio

Controle total, zero lock-in. Requer servidor, CI/CD e operação contínua — incompatível com a restrição de zero DevOps e prazo curto.

**Recomendação:** Opção A. Supabase entrega auth, banco, storage e realtime com uma única integração. O Drizzle ORM como camada de acesso ao banco isola a aplicação do Supabase — a migração futura de provedor não reescreve queries.

**ORM:** Drizzle sobre Prisma. Bundle mínimo, sem binário Rust, compatível com edge. Prisma gera cold start lento em ambiente serverless Vercel.

---

## 4. Leitor de PDF

### Opção A — pdf.js

Renderização no browser, sem proxy de servidor. Acesso programático a metadados de página — necessário para ancoragem de comentários por número de página, o diferencial central da plataforma.

### Opção B — react-pdf

Wrapper sobre pdf.js. Adiciona abstração sem ganho relevante. Menos controle sobre eventos de página.

### Opção C — iframe embed (Google Docs Viewer / PDF nativo)

Zero configuração. Sem acesso a eventos de página — impossível implementar comentários por página sem JavaScript adicional complexo.

**Recomendação:** Opção A. O acesso direto à API do pdf.js é indispensável para vincular comentários à página exata onde foram criados.

---

## 5. Estrutura de repositório

### Opção A — Repositório único (single repo)

Frontend, routers tRPC e schema Drizzle no mesmo projeto Next.js. Sem tooling extra.

### Opção B — Monorepo com Turborepo

Pacotes separados para `web`, `db` e `validators`. Faz sentido quando há múltiplos apps consumindo os mesmos pacotes.

**Recomendação:** Opção A. O backend é inteiramente Supabase — não existe serviço Node.js separado. Monorepo adicionaria complexidade de tooling sem nenhum benefício concreto na POC. Revisitar quando houver app mobile ou SDK público.

---

## Stack proposta consolidada

```
Repositório → Único (single repo Next.js)
Framework   → Next.js 14 App Router
API         → tRPC + Zod
Auth        → Auth.js v5
ORM         → Drizzle
Banco       → Supabase Postgres
Storage     → Supabase Storage + Cloudflare CDN
Realtime    → Supabase Realtime
Cache       → TanStack Query
Estado UI   → Zustand
Leitor PDF  → pdf.js
Analytics   → Posthog (free tier)
Erros       → Sentry (free tier)
Email       → Resend (free tier)
```

---

## Riscos identificados

| Risco                                     | Probabilidade | Mitigação                                                                |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------ |
| Supabase pausa projeto inativo            | média         | Acesso semanal ou cron de keep-alive                                     |
| pdf.js com performance em roteiros longos | baixa         | Virtualização de páginas; carregar sob demanda                           |
| tRPC dificulta API pública futura         | baixa         | Expor endpoints REST via Next.js API routes quando necessário            |
| Vercel timeout de 10s no Hobby            | baixa         | Uploads diretos para Supabase Storage — sem passar pelo servidor Next.js |

---

## Decisão

Stack aprovada conforme proposta consolidada acima.

Registrada integralmente na ADR-001 — Arquitetura da plataforma Antes da Tela.

---

## Critério de reabertura

Este RFC deve ser reaberto se:

- a POC validar crescimento que justifique separar serviços
- surgir necessidade de API pública para consumo por terceiros
- o time crescer e demandar estrutura de monorepo

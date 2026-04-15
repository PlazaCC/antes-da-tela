# POC — Antes da Tela

Plataforma de roteiros para roteiristas — documento de referência da Proof of Concept (POC).

---

# 1. Visão geral

`Antes da Tela` é uma plataforma centrada em roteiros audiovisuais, com foco em publicação, leitura, discussão e avaliação. A POC valida hipóteses de demanda por leitura de roteiros, valor de feedback estruturado e utilidade de curadoria editorial.

Objetivos principais:

- validar consumo de roteiros em PDF
- validar interesse por comentários por página e feedback estruturado
- validar valor de curadoria e avaliações críticas para descoberta

Escopo inicial: um repositório de roteiros em PDF com leitor embutido, upload, autenticação e funcionalidades básicas de descoberta.

---

# 2. Hipóteses da POC

- Hipótese 1 — Consumo: existe demanda por leitura centralizada de roteiros.
- Hipótese 2 — Comunidade: roteiristas querem feedback estruturado.
- Hipótese 3 — Curadoria: curadoria aumenta descoberta.

---

# 3. Público-alvo

Primário: roteiristas iniciantes, estudantes de cinema/áudio e escritores de narrativa audiovisual.

Secundário: produtores, diretores, leitores de storytelling, críticos e curadores.

---

# 4. Funcionalidades da POC (escopo mínimo viável)

1. Upload de PDF
   - upload de arquivo
   - armazenamento (Supabase Storage)
   - geração de link interno e associação com metadados do roteiro

2. Leitor de PDF integrado
   - navegação por páginas, zoom, scroll
   - identificação da página atual
   - base para ancoragem de comentários por página
   - implementação preferida: `pdf.js` com import dinâmico e render por demanda

3. Sistema de registro e perfis
   - cadastro: nome, email, senha
   - perfis simplificados para POC (nome, bio, avatar, lista de roteiros)

4. Comentários por página
   - cada comentário vinculado a um número de página
   - threads, edição e remoção por autor
   - visibilidade pública por padrão

5. Player de áudio (opcional para POC, desejável)
   - upload e streaming de arquivos de áudio associados ao roteiro

6. Descoberta básica
   - lista de roteiros recentes
   - destaque e categorias simples

7. Observability & Email
   - analytics (PostHog), erro tracking (Sentry), emails transacionais (Resend)

---

# 5. Estrutura das páginas (UX)

- Página inicial: hub de descoberta — lista de roteiros, filtros simples, destaque.
- Página de roteiro: metadados (título, logline, sinopse, autor, banner), leitor PDF embutido, comentários e player de áudio.
- Cadastro de roteiro: formulário + upload de PDF.

---

# 6. Comentários por página (fluxo)

1. Usuário abre roteiro e navega até a página X.
2. Usuário adiciona comentário vinculado à página X.
3. Comentários aparecem em painel lateral / inline e são filtráveis por página.

Requisitos técnicos: acesso programático ao número de página do viewer (API do `pdf.js`), armazenamento de metadados do comentário (script_id, page_number, author_id, content, created_at).

---

# 7. Player de áudio

Cada roteiro pode ter um arquivo de áudio associado (narração, pitch, comentários do autor). Suporte a upload e streaming via Supabase Storage.

---

# 8. Curadoria e avaliação

- Avaliação da comunidade: sistema simplificado por estrelas (1–5) ou métricas separadas (narrativa, personagens, ritmo).
- Curadoria editorial: resenhas estruturadas por curadores (nota geral, análise, pontos fortes/fracos).

---

# 9. Pesquisa de mercado (concorrentes e inspiração)

- Script Revolution, The Black List, Coverfly, ScriptHop, Wattpad — analisar modelos de curadoria, avaliação e descoberta.

Aprendizado chave: comentários ancorados a trechos/partes geram alto engajamento (Wattpad é um case importante).

---

# 10. Modelos de negócio potenciais

1. Freemium — recursos premium: destaque, analytics, perfil avançado.
2. Avaliação profissional paga — pagamentos por análises profissionais.
3. Marketplace/licenciamento — comissionamento por negociações.
4. Comunidade premium — assinatura para workshops e feedbacks.

---

# 11. Métricas de validação da POC

- Engajamento: número de roteiros, leituras, tempo médio de leitura.
- Interação: comentários por roteiro/página.
- Qualidade: número de avaliações e resenhas.

---

# 12. Arquitetura técnica (recomendada para POC)

- Frontend: Next.js (App Router) + React + TypeScript
- API: tRPC + Zod
- Autenticação: Supabase Auth (`@supabase/ssr`)
- Banco: Supabase Postgres
- ORM: Drizzle ORM (configurado para Supabase pooler)
- Storage: Supabase Storage (+ Cloudflare CDN)
- Viewer PDF: `pdf.js` (via `pdfjs-dist`) com import dinâmico
- Estado: Zustand; UI: shadcn/ui + Tailwind CSS v3
- Observability: PostHog, Sentry; Email: Resend

---

# 13. Próximos passos para implementação (prioridade)

1. Definir schema Drizzle para `scripts`, `script_files`, `comments`, `ratings`, `audio_files`.
2. Implementar fluxo de upload (preferir upload direto cliente → Supabase Storage com políticas autenticadas).
3. Implementar viewer PDF básico com `pdfjs-dist` (import dinâmico, render por demanda).
4. Implementar comentários por página: DB + API (tRPC) + UI.
5. Criar routers tRPC de domínio e testes de integração básicos.
6. Fechar decisão de infraestrutura (RFC-002) e documentar ADR correspondente.

---

# 14. Funcionalidades adicionais / ideias de viralidade

- Comentários de trecho com anotações (semelhante ao Wattpad).
- Heatmap de interesse por página.
- Desafios/concursos com destaque editorial.
- Compartilhamento visual de trechos comentados para redes sociais.

---

# 15. Observações finais

Este documento é a versão canônica da POC a ser comitada no repositório. Mantenha-o sincronizado com ADRs e RFCs e atualize-o quando decisões de arquitetura ou escopo forem alteradas.

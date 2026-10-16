# RFC-006 — Onboarding por perfil, Intérpretes e Editais de Roteiro

| Campo  | Valor                                                                  |
| :----- | :--------------------------------------------------------------------- |
| Status | Rascunho — wireframes low-fi no Figma; front/back ainda não implementados |
| Data   | 2026-10-16                                                             |
| Escopo | Onboarding, perfil, intérpretes, editais, casting, votação, admin      |
| Figma  | [Antes da Tela — node 114-40](https://www.figma.com/design/zStThNjhc7D549LiLBx1Pp/Antes-da-tela?node-id=114-40) |

Reconstrói os dois rascunhos informais (fluxo FRAPA/ABRA e lista de páginas) num fluxo único e
mapeia o que muda na plataforma. Ordem de trabalho proposta: **1) wireframe low-fi no Figma →
2) validação com o time → 3) backend → 4) frontend**, em fases que entregam valor isoladas (§6).

---

## 1. Visão geral dos fluxos

```
                         ┌──────────── primeiro login ────────────┐
                         ▼                                        │
                  [O1] Qual a sua intenção?                       │
          ┌──────────────┼───────────────────┐                    │
       Leitor        Produtor            Intérprete               │
          │              │                   │                    │
   [O2] Completar   [O2] Completar     [O2] Completar perfil      │
     perfil (opc.)    perfil (opc.)          │                    │
          │              │             [O4] Cadastro de intérprete│
          │              │               (opc. — "fazer depois")  │
   [O3] Pesquisa    [O3] Pesquisa            │                    │
     (opc.)           (opc.)           [O3] Pesquisa (opc.)       │
          │              │                   │                    │
          │         [O5] Publicar            │                    │
          │           roteiro (opc.)         │                    │
          ▼              ▼                   ▼                    │
                       /feed  ◄──────────────────────────────────-┘
```

Edital (depois que o onboarding existe):

```
Admin cria edital ─► Roteirista inscreve roteiro + personagens ─► Admin aprova inscrições
   ─► Intérpretes aprovados enviam casting por personagem ─► Admin faz curadoria (até 3 por personagem)
   ─► Roteirista escolhe/confirma elenco ─► Votação pública ─► Vencedor ─► Live paga ─► Gravação paga na plataforma
```

---

## 2. Wireframes low-fi (Figma)

> **Wireframes criados** na página `wireframe` do Figma, frame
> [Fluxo — Onboarding, Intérpretes & Editais (low-fi)](https://www.figma.com/design/zStThNjhc7D549LiLBx1Pp/Antes-da-tela?node-id=409-187).

Convenções do wireframe: mesmo estilo dos wireframes existentes da página (mobile 412, fundo escuro,
blocos cinza, Inter); telas de admin em desktop 1280. Cada frame se chama `ID — Nome` para casar com
esta tabela. Componentes locais `WF/*` (botão, input, chip, card, mídia, upload, stepper, nota) no
grupo "Componentes WF". Notas amarelas indicam a próxima tela do fluxo e decisões em aberto.

### 2.1 Onboarding

| ID  | Tela | Conteúdo mínimo |
| :-- | :--- | :-------------- |
| O1  | Escolha de intenção | 3 cards selecionáveis (Leitor / Produtor / Intérprete) com 1 linha de descrição; **multi-seleção** (ver Q1); CTA "Continuar"; progresso (stepper) |
| O2  | Completar perfil | Foto, nome, "como quer ser chamado" (nome artístico), pronomes (select + livre), gênero (opcional, "prefiro não dizer"), data de nascimento (opc.), cidade/UF, bio, links (Instagram, site, IMDb/portfolio); "Pular" e "Salvar e continuar" |
| O3  | Pesquisa de preferências | Chips de gêneros (reaproveita `GENRES` de `lib/constants/scripts.ts`), formatos (longa, curta, série, podcast/áudio), temas/afinidades, faixa etária de interesse, "o que você quer fazer aqui" (ler, dar feedback, descobrir talentos…); "Pular" |
| O4a | Intérprete — modalidades | Checkbox Atuar / Narrar (um ou os dois); "Fazer depois" leva direto ao O3 |
| O4b | Intérprete — material | Atuar (ou ambos): upload de **vídeo** até 30 s. Só Narrar: upload de **áudio** até 30 s. Prévia do arquivo, contador de duração, dicas de gravação; campos extras: experiência, DRT (opc.), faixa etária de atuação, sotaques/idiomas |
| O4c | Intérprete — enviado | "Seu cadastro está em curadoria" + status; CTA seguir para pesquisa |
| O5  | Produtor — primeiro roteiro | Convite para publicar (leva ao `/publish` existente) ou "Depois" |
| O6  | Fim | Boas-vindas + atalhos por perfil (feed, editais abertos, perfil) |

### 2.2 Perfil e configurações

| ID  | Tela | Conteúdo mínimo |
| :-- | :--- | :-------------- |
| P1  | Editar perfil (estendido) | Campos novos do O2 dentro de `/profile/edit` |
| P2  | Preferências | O mesmo formulário do O3, editável a qualquer momento (`/profile/preferences`) |
| P3  | Área do intérprete | Status (pendente / aprovado / reprovado + motivo), modalidades, mídia de apresentação, reenviar; atalho para editais abertos |
| P4  | Perfil público (selo) | Badge "Intérprete — Ator/Narrador" e player da apresentação (só se aprovado) |

### 2.3 Edital

| ID  | Tela | Conteúdo mínimo |
| :-- | :--- | :-------------- |
| E1  | Lista de editais | Cards: nome, organizador/parceiro (FRAPA, ABRA, EBAC), fase atual, prazos |
| E2  | Página do edital | Regras, cronograma (inscrição → casting → votação → live), roteiros inscritos, CTA por perfil |
| E3  | Inscrever roteiro | Selecionar roteiro já publicado (lista do autor) + "publicar novo roteiro"; aceite do regulamento |
| E4  | Personagens | Lista editável: nome, descrição, idade aparente, gênero, características, modalidade (atuar/narrar), cena/trecho de referência (página do PDF ou texto) |
| E5  | Acompanhamento da inscrição | Status por fase, personagens, nº de castings recebidos, finalistas da curadoria |
| E6  | Escolha de elenco (roteirista) | Por personagem: até 3 opções curadas (player + perfil) → escolher 1 |
| E7  | Casting — página do intérprete | Personagens abertos filtrados pela modalidade do intérprete; cards com características |
| E8  | Casting — envio | Personagem + descrição; opção "usar minha mídia de cadastro" ou enviar nova (≤ 30 s); observação |
| E9  | Votação | Grid dos roteiros finalistas (logline, elenco, preview), botão votar (1 voto por usuário por edital — Q5), contagem ao fim |
| E10 | Página do vencedor | Roteiro, elenco, data da live, compra de ingresso / acesso à gravação |

### 2.4 Admin

| ID  | Tela | Conteúdo mínimo |
| :-- | :--- | :-------------- |
| A1  | Fila de intérpretes | Tabela: nome, modalidades, data; player; aprovar / reprovar com motivo |
| A2  | Gestão de editais | Criar/editar edital, datas de cada fase, avançar fase manualmente |
| A3  | Inscrições do edital | Aprovar/recusar roteiros inscritos |
| A4  | Curadoria de casting | Por personagem: castings recebidos, marcar até 3 como finalistas |
| A5  | Resultados | Contagem de votos, declarar vencedor, cadastrar live/gravação |

---

## 3. Estado atual da plataforma (o que já existe)

- **Auth:** Clerk + `users` (id, name, email, image, bio, clerkId, deactivatedAt). `getAppUser()` cria/vincula o usuário no primeiro acesso — é o gancho natural para detectar "primeiro login".
- **Roteiros:** `scripts`, `script_files`, `audio_files`, publicação em `components/publish/*` (wizard em steps — padrão reaproveitável para o onboarding).
- **Social:** comentários, reações, ratings, follows.
- **Não existe:** papel de admin, preferências, campos de perfil estendidos, mídia de vídeo, pagamentos, nenhum conceito de edital/fase.

---

## 4. Backend

### 4.1 Schema (Drizzle — `server/db/schema.ts` + `yarn db:generate`)

**Alterações em `users`**

| Coluna | Tipo | Nota |
| :----- | :--- | :--- |
| `display_name` | text | "como quer ser chamado" |
| `pronouns` | text | |
| `gender` | text | opcional; **não** expor publicamente sem opt-in (LGPD — dado sensível em alguns contextos) |
| `location` | text | |
| `links` | jsonb | `{ instagram, website, portfolio }` |
| `intents` | `user_intent[]` | enum `reader \| producer \| interpreter` |
| `role` | enum `user_role` | `user \| admin`, default `user` |
| `onboarding_completed_at` | timestamp | null = mostrar onboarding |

> `users` é publicamente legível (policy `Users are publicly readable`). Campos privados (gênero,
> data de nascimento) devem ir para uma tabela própria com RLS só do dono, como foi feito com
> `user_documents` no RFC-005. Proposta: `user_private_profile`.

**Tabelas novas**

| Tabela | Colunas principais | RLS |
| :----- | :----------------- | :-- |
| `user_preferences` | user_id (PK/FK), genres text[], formats text[], themes text[], goals text[], updated_at | dono lê/escreve |
| `interpreter_profiles` | user_id (PK), modalities `interpreter_modality[]` (`acting \| narration`), status `review_status` (`pending \| approved \| rejected`), media_path, media_type (`video \| audio`), duration_seconds, experience, reviewed_by, reviewed_at, rejection_reason | dono lê/escreve (sem mudar status); público lê se `approved`; admin tudo |
| `calls` (editais) | id, slug, title, description, partner, phase `call_phase` (`draft \| submissions \| casting \| curation \| voting \| finished`), datas por fase, created_by | público lê se ≠ draft; admin escreve |
| `call_entries` | id, call_id, script_id, author_id, status `review_status`, created_at; unique(call_id, script_id) | autor cria/lê os seus; público lê aprovados; admin tudo |
| `call_characters` | id, entry_id, name, description, traits jsonb, modality, reference_page, sort_order | autor da entry escreve; público lê |
| `casting_submissions` | id, character_id, interpreter_id, media_path, reuses_profile_media bool, note, status (`submitted \| shortlisted \| selected \| rejected`), created_at; unique(character_id, interpreter_id) | intérprete cria/lê os seus; autor do roteiro lê só `shortlisted/selected`; admin tudo |
| `call_votes` | call_id, entry_id, user_id, created_at; unique(call_id, user_id) | usuário cria o seu; contagem via RPC |

**Migrações custom** (`yarn db:generate --custom <nome>`):
- `public.is_admin()` (SQL `security definer`, baseada em `current_user_id()`), usada nas policies acima.
- RPC `call_vote_counts(call_id)` — contagem agregada sem expor quem votou.
- Policies de storage para os buckets novos.
- Trigger/constraint para só aceitar voto com `calls.phase = 'voting'` e casting com `phase = 'casting'`.

### 4.2 Storage

| Bucket | Visibilidade | Caminho | Nota |
| :----- | :----------- | :------ | :--- |
| `interpreter-media` | privado | `{userId}/{timestamp}_{filename}` | apresentação do intérprete; signed URL no servidor |
| `casting-media` | privado | `{userId}/{characterId}/{timestamp}_{filename}` | só intérprete dono, admin e (se shortlisted) autor |

- Upload **client-side** (limite de 10 s da Vercel), como já é feito para PDF/áudio.
- Duração ≤ 30 s validada no client (`HTMLMediaElement.duration`) **e** gravada em `duration_seconds`; limite de tamanho no bucket (ex.: vídeo 50 MB, áudio 5 MB).
- Formatos: vídeo `mp4/webm/mov`, áudio `mp3/m4a/wav/webm`. Gravar direto pelo navegador (MediaRecorder) fica como melhoria.

### 4.3 tRPC

Novo `adminProcedure` em `trpc/init.ts` (estende `authenticatedProcedure`, exige `ctx.user.role === 'admin'`).

| Router | Procedures |
| :----- | :--------- |
| `users` (existente) | `updateProfile` estendido; `setIntents`; `completeOnboarding`; `getPreferences` / `upsertPreferences` |
| `interpreters` (novo) | `getMine`, `upsert` (modalidades + mídia → status volta a `pending`), `getPublic(userId)` |
| `calls` (novo) | `list`, `getBySlug`, `createEntry`, `updateEntry`, `upsertCharacters`, `listMyEntries`, `listOpenCharacters` (filtra pela modalidade do intérprete), `submitCasting`, `listMyCastings`, `getShortlist(entryId)` (autor), `selectCast`, `vote`, `getResults` |
| `admin` (novo) | `listInterpreters`, `reviewInterpreter`, `upsertCall`, `setCallPhase`, `reviewEntry`, `listCastings(characterId)`, `shortlistCasting`, `declareWinner` |

Services em `server/services/*.service.ts` seguindo o padrão atual; validators Zod em `lib/validators`.

### 4.4 Outros serviços

- **Resend:** e-mails de "cadastro de intérprete aprovado/reprovado", "você foi pré-selecionado", "votação aberta", "resultado".
- **PostHog:** eventos `onboarding_step_viewed/completed/skipped`, `intent_selected`, `interpreter_submitted`, `casting_submitted`, `vote_cast` — mede exatamente o que a POC quer validar.
- **Pagamentos (live R$ 1,99 + repasse X% para intérpretes):** fora deste RFC. Exige escolher provedor (Stripe / Mercado Pago / Pix), split de pagamento e questões fiscais. Proposta para a POC: live via plataforma externa com ingresso externo e cadastro manual da gravação (A5); integrar pagamento num RFC próprio.

---

## 5. Frontend

### 5.1 Rotas novas

| Rota | Grupo | Telas |
| :--- | :---- | :---- |
| `/onboarding` (+ `?step=`) | `(authenticated)` | O1–O6 |
| `/profile/preferences` | `(authenticated)/(dashboard)` | P2 |
| `/profile/interpreter` | `(authenticated)/(dashboard)` | P3 |
| `/editais`, `/editais/[slug]` | público | E1, E2, E9, E10 |
| `/editais/[slug]/inscricao` | `(authenticated)` | E3, E4, E5, E6 |
| `/editais/[slug]/casting` | `(authenticated)` | E7, E8 |
| `/admin/*` | novo grupo `(admin)` com layout que checa `role` | A1–A5 |

### 5.2 Redirecionamento para o onboarding

- Clerk: `signUpForceRedirectUrl="/onboarding"` nas páginas de sign-up.
- Fallback: em `app/(authenticated)/layout.tsx` (e no `/feed`), se `onboarding_completed_at` é null → redirect para `/onboarding`. Usuários antigos: marcar `onboarding_completed_at = created_at` na migração e mostrar só um banner "complete seu perfil" (evita bloquear quem já usa).
- Pular qualquer passo nunca bloqueia; o último passo sempre grava `onboarding_completed_at`.

### 5.3 Componentes (wrappers sobre `components/ui/`, ≤ 150 linhas/arquivo)

- `components/onboarding/` — `onboarding-wizard`, `intent-step`, `profile-step`, `preferences-step`, `interpreter-step`, `stepper`; estado do wizard em Zustand (igual ao publish).
- `components/preferences/preferences-form` — compartilhado entre O3 e P2.
- `components/interpreter/` — `media-upload-field` (valida duração, preview de vídeo/áudio), `interpreter-status-card`, `interpreter-badge`.
- `components/calls/` — `call-card`, `call-timeline`, `character-editor`, `character-card`, `casting-form`, `shortlist-picker`, `vote-card`.
- `components/admin/` — `review-queue-table`, `media-review-player`.
- shadcn possivelmente necessários (via CLI): `checkbox`, `toggle-group`, `table`, `progress`, `stepper` (se houver no registry).
- Reaproveitar: `components/drag-zone`, `components/audio-player`, `components/publish/file-upload-field`, `components/tag`.

---

## 6. Fases de entrega

| Fase | Entrega | Depende de |
| :--- | :------ | :--------- |
| 0 | Wireframes low-fi no Figma (§2) + validação com o time; fechar as perguntas da §7 | conector Figma autorizado |
| 1 | Onboarding: intents, perfil estendido, preferências, redirect de primeiro login, analytics | — |
| 2 | Intérpretes: cadastro + mídia, papel admin, fila de aprovação (A1), badge no perfil | 1 |
| 3 | Editais: criação (admin), inscrição de roteiro + personagens, acompanhamento | 2 (admin) |
| 4 | Casting: página orientada a personagens, envio, curadoria (A4), escolha do roteirista | 3 |
| 5 | Votação + vencedor | 4 |
| 6 | Live/gravação paga e repasse — RFC separado | 5 |

Cada fase vira uma task em `docs/poc/tasks/` via `/create-poc-task`.

---

## 7. Perguntas em aberto

1. **Intenção é escolha única ou múltipla?** Um produtor também pode ser intérprete. Proposta: multi-seleção, fluxo = união dos passos.
2. **Áudio de cadastro para quem atua e narra:** só vídeo, ou vídeo + áudio opcional?
3. **Quem pode criar edital?** Só admin (proposta) ou também parceiros (FRAPA/ABRA/EBAC)?
4. **Roteiro inscrito precisa estar publicado?** O texto diz "já publicou (deixar opção de adicionar mais)" — inscrever vários roteiros por autor no mesmo edital?
5. **Regras de voto:** 1 voto por edital ou 1 por roteiro? Precisa estar logado (proposta: sim, evita fraude)?
6. **Escolha final do elenco:** o roteirista escolhe entre as 3 opções, ou o staff decide (rascunho 1: "Staff toma a decisão de qual ator vai fazer qual personagem")?
7. **Autorização de uso de imagem/voz** dos intérpretes: precisa de termo de aceite no cadastro (LGPD + direitos de imagem).
8. **Área de embaixadores/mentores e logos de parceiros** (rascunho 1): entram neste escopo ou na landing?
9. **Intérprete menor de idade:** permitido? Exige responsável?

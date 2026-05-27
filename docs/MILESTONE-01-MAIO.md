# Milestone 01 — Maio

Plataforma de publicação, leitura e discussão de roteiros audiovisuais.

---

## F1 — Open Graph

Garantir que todas as páginas tenham metadados OG corretos para compartilhamento em redes sociais, WhatsApp e afins.

**Padrão global (páginas comuns):**

- Título: `Antes da Tela - Propriedades Intelectuais Audiovisuais`
- Descrição: `Publique, leia e proteja suas propriedades intelectuais audiovisuais. Roteiros, pitches e obras registradas em um só lugar.`
- Imagem: `/antes-da-tela-og.png` (já existe em `public/`)

**Páginas de obra:** título e descrição dinâmicos (já implementado em `app/scripts/[id]/page.tsx`), imagem é o banner da obra ou fallback para `/antes-da-tela-og.png`.

### Steps

- [x] **F1.1** — Atualizar `app/layout.tsx` (`metadata` estático):
  - `title.default`: `Antes da Tela - Propriedades Intelectuais Audiovisuais`
  - `title.template`: `%s | Antes da Tela`
  - `description`: texto acima
  - `openGraph.images`: `/antes-da-tela-og.png`
  - `twitter.card`: `summary_large_image`
  - `twitter.images`: `/antes-da-tela-og.png`

- [x] **F1.2** — Corrigir fallback de imagem em `app/scripts/[id]/page.tsx` (linha ~66): trocar `/opengraph-image.png` por `/antes-da-tela-og.png`

- [x] **F1.3** — Adicionar `generateMetadata` em `app/page.tsx` (home) com título, descrição e og:image padrões

- [x] **F1.4** — Adicionar `generateMetadata` em `app/profile/[userId]/page.tsx` com nome do autor como título dinâmico

---

## F2 — Link à Biblioteca Nacional e Disclaimer de Direitos Autorais

Orientar o usuário a registrar a obra e isentar a plataforma de responsabilidade sobre direitos autorais.

**URL:** `https://www.gov.br/pt-br/servicos/registrar-ou-averbar-direitos-autorais-na-biblioteca-nacional`

### Steps

- [x] **F2.1** — Criar componente `BnDisclaimerCallout` em `components/publish/bn-disclaimer-callout.tsx`:
  - Card informativo com ícone de aviso
  - Texto: _"O Antes da Tela não se responsabiliza pelos direitos autorais das obras publicadas na plataforma. Ao publicar, você declara ser o autor ou ter os direitos necessários. Recomendamos o registro prévio da sua obra na Biblioteca Nacional do Brasil."_
  - Link externo: "Registrar obra na Biblioteca Nacional →" (abre em nova aba)

- [x] **F2.2** — Inserir `BnDisclaimerCallout` no `review-step.tsx` (etapa de revisão antes de publicar), acima do botão de confirmação

- [x] **F2.3** — Criar componente `BnCalloutCard` em `components/script-page/bn-callout-card.tsx`:
  - Card com link para BN e texto encorajando registro
  - Visível apenas quando `isOwner === true`

- [x] **F2.4** — Inserir `BnCalloutCard` em `script-page-client.tsx` logo abaixo da seção de metadados (`ScriptPageMetadata`), condicional em `isOwner`

---

## F3 — Pitch Deck

Upload e visualização de um PDF de pitch deck vinculado ao roteiro.

> **Nota:** A migração de armazenamento para S3 está planejada. O campo `pitch_deck_path` é uma coluna de texto (storage-agnóstica) — a URL de acesso será gerada pela camada de storage ativa. Nenhuma integração específica de Supabase Storage ou S3 precisa ser decidida agora; o upload seguirá o mesmo padrão atual do `pdfStoragePath`.

### Steps — Schema e Migration

- [x] **F3.1** — Adicionar coluna `pitchDeckPath: text('pitch_deck_path')` (nullable) na tabela `scripts` em `server/db/schema.ts`

- [x] **F3.2** — Gerar migration: `yarn db:generate` (ou `--custom add-pitch-deck-path` se preferir nomear)

- [x] **F3.3** — Aplicar migration: `yarn db:migrate` (aplicado manualmente)

### Steps — Upload no Wizard de Publicação

- [x] **F3.4** — Adicionar `pitchDeckStoragePath` ao schema Zod em `lib/validators/publish.ts`

- [x] **F3.5** — Adicionar estado e upload do pitch deck em `lib/hooks/use-publish-files.ts`:
  - `pitchDeckFile`, `setPitchDeckFile`
  - `pitchDeckProgress`, `pitchDeckError`, `onSetPitchDeckError`
  - Upload segue o mesmo padrão do `pdfFile` (reusa `validatePDF`)

- [x] **F3.6** — Passar as novas props ao `FileStep` via `use-publish-upload.ts` e `publish-page.tsx`

- [x] **F3.7** — Adicionar `FileUploadField` para pitch deck em `file-step.tsx`:
  - Label: `Pitch Deck`
  - `labelInfo`: `Opcional`
  - `infoText`: `Limite: 5MB. Apenas PDF.`
  - Aceita: `application/pdf`
  - Preview: ícone `FileIcon` (igual ao roteiro)

- [x] **F3.8** — Atualizar `scripts.create` e `scripts.update` nos routers tRPC (`server/api/scripts.ts`) para ler e salvar `pitchDeckPath`

### Steps — Visualização na Página do Roteiro

- [x] **F3.9** — Resolver `pitchDeckUrl` em `app/scripts/[id]/page.tsx` (mesmo padrão de `pdfUrl` e `audioUrl`), passar como prop ao `ScriptPageClient`

- [x] **F3.10** — Adicionar `pitchDeckUrl` à interface `Props` de `script-page-client.tsx`

- [x] **F3.11** — Criar botão/seção "Ver Pitch Deck" na página do roteiro, abaixo dos metadados:
  - Visível apenas quando `pitchDeckUrl` existe
  - Abre modal com `<PDFViewer url={pitchDeckUrl} />` (componente já existente)
  - Usar `Dialog` do shadcn para o modal

---

## F4 — Experiência de Leitura de PDF (Grid 25/50/25)

Reorganizar o layout do leitor para um grid de três colunas no desktop.

**Layout novo (desktop `lg:`):**

- Coluna esquerda `lg:w-1/4` — reservada, sem funcionalidade por enquanto (espaço vazio)
- Coluna central `lg:w-1/2` — `<PDFViewer>`
- Coluna direita `lg:w-1/4` — `<CommentsSidebar>` (sticky)

**Mobile:** sem alterações (PDF full width, comentários permanecem no sheet)

### Steps

- [x] **F4.1** — Atualizar o bloco do reader em `script-page-client.tsx` (linha ~169):
  - Trocar `flex flex-col lg:flex-row` por grid de 3 colunas
  - Coluna esquerda: `hidden lg:block lg:w-1/4` (div vazia por enquanto)
  - Coluna central (PDF): `flex-1 lg:w-1/2`
  - Coluna direita (sidebar): `hidden lg:flex lg:w-1/4`

- [x] **F4.2** — Ajustar `CommentsSidebar` para funcionar adequadamente na largura menor (25% do viewport):
  - Verificar se textos, inputs e padding estão responsivos ao container mais estreito
  - Ajustar padding interno se necessário

- [x] **F4.3** — Verificar comportamento `sticky` da sidebar na nova largura (coluna direita mantém `sticky top-14 self-start h-[calc(100vh-3.5rem)]`)

- [x] **F4.4** — Testar em viewport desktop (≥1024px) e mobile (<1024px) para garantir que:
  - PDF centralizado aparece correto no desktop
  - Mobile não foi afetado (sheet de comentários continua funcionando)
  - Audio player (quando presente) não quebra o layout

---

## F5 — Migração de Upload para AWS S3

Substituir o Supabase Storage como destino de upload por um bucket S3, mantendo a experiência de upload com progresso intacta e sem alterar o schema do banco.

### Contexto e decisões de arquitetura

**O que muda:** apenas a camada de transporte do upload e a geração de URLs públicas. Toda a lógica de estado de arquivo (`usePublishFiles`), progresso (`usePublishUploadProgress`) e formulário (`usePublishForm`) permanece igual.

**Padrão adotado — Presigned URL:**

1. Cliente solicita uma URL pré-assinada para PUT a uma rota de API autenticada
2. Cliente envia o arquivo diretamente ao S3 via XHR usando essa URL (sem credenciais AWS no browser)
3. A chave S3 (path) é salva no banco — mesmo formato e colunas de hoje

**Estrutura de chaves no S3 (único bucket, prefixos por tipo):**

```
scripts/{userId}/{timestamp}_{filename}.pdf
audio/{userId}/{timestamp}_{filename}.mp3
covers/{userId}/{timestamp}_{filename}.jpg
banners/{userId}/{timestamp}_{filename}.jpg
pitch-decks/{userId}/{timestamp}_{filename}.pdf
```

As colunas do banco (`storage_path`, `cover_path`, `banner_path`, `pitch_deck_path`) passam a armazenar a chave completa incluindo o prefixo de pasta — continuam sendo strings simples.

**Coexistência durante a transição:** arquivos já existentes no Supabase Storage continuam servidos pela URL do Supabase. A função `getAssetUrl()` detecta pelo prefixo da chave se deve gerar URL Supabase ou S3, permitindo migração gradual sem downtime.

---

### F5.0 — Setup e configuração

- [x] **F5.0.1** — Instalar dependências:

  ```bash
  yarn add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
  ```

- [x] **F5.0.2** — Adicionar variáveis de ambiente em `.env` e `.env.example`:

  ```
  AWS_REGION=
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  AWS_S3_BUCKET=
  NEXT_PUBLIC_S3_PUBLIC_URL=   # base URL pública (pode ser CloudFront ou https://{bucket}.s3.{region}.amazonaws.com)
  ```

- [ ] **F5.0.3** — Criar bucket S3 com:
  - Acesso público de leitura (ou via CloudFront) para as pastas de assets
  - CORS configurado para aceitar PUT do domínio da aplicação (localhost + produção)
  - Bloquear acesso público de escrita direto (escrita apenas via presigned URL)

---

### F5.1 — Infraestrutura server-side

- [x] **F5.1.1** — Criar `lib/storage/s3-client.ts`: singleton do `S3Client` usando as env vars AWS

- [x] **F5.1.2** — Criar `app/api/upload/presign/route.ts` (POST):
  - Valida sessão Supabase server-side (rejeita sem sessão ativa)
  - Recebe `{ key: string, contentType: string }` no body
  - Valida que o prefixo do `key` começa com `{userId}/` dentro da pasta correta (previne path traversal e upload em nome de outro usuário)
  - Valida `contentType` contra lista de tipos permitidos (pdf, mp3, wav, jpg, png, webp)
  - Retorna `{ presignedUrl: string }` com expiração de 5 minutos

- [x] **F5.1.3** — Criar `lib/storage/url.ts` com `getAssetUrl(key: string): string`:
  - Se a chave não contém `/` de prefixo de pasta (padrão antigo do Supabase, ex: `{userId}/{timestamp}_file.pdf`), serve da URL do Supabase Storage como fallback
  - Se começa com `scripts/`, `audio/`, `covers/`, `banners/`, `pitch-decks/`, monta URL S3/CDN
  - Usar `NEXT_PUBLIC_S3_PUBLIC_URL` como base

---

### F5.2 — Adaptar upload client-side

- [x] **F5.2.1** — Refatorar `lib/hooks/use-publish-upload.ts`:
  - Remover dependência do Supabase client e do `NEXT_PUBLIC_SUPABASE_URL`
  - Remover `getAccessToken()` e `getUserId()` (auth fica no servidor, na rota de presign)
  - Reescrever `uploadFile(key, file, onProgress)`:
    1. `POST /api/upload/presign` com `{ key, contentType: file.type }` — obtém `presignedUrl`
    2. XHR `PUT` direto ao `presignedUrl` com o arquivo (sem header de auth — credenciais estão na URL)
    3. Reporta progresso via `xhr.upload.onprogress` (igual ao atual)

- [x] **F5.2.2** — Ajustar `usePublishForm.handlePublish()` em `lib/hooks/use-publish-form.ts`:
  - A função `uploadAsset()` interna passa a gerar a chave S3 completa com prefixo de pasta (ex: `scripts/${uid}/...`)
  - Remover o parâmetro `bucket` de `uploadAsset` — o prefixo da pasta já identifica o tipo
  - Remover a chamada `getAccessToken()` / `getUserId()` antes do loop de uploads
  - O `getUserId()` pode vir do `useCurrentUser()` já disponível no hook

---

### F5.3 — Adaptar resolução de URLs públicas

- [x] **F5.3.1** — Atualizar `app/scripts/[id]/page.tsx`: substituir todas as chamadas `ctx.supabase.storage.from(bucket).getPublicUrl(path)` por `getAssetUrl(path)` (importado de `lib/storage/url.ts`)

- [x] **F5.3.2** — Atualizar `lib/utils.ts`: a função `getStorageUrl(bucket, path)` existente passa a chamar `getAssetUrl(path)` internamente (ou é deprecada e substituída diretamente)

- [x] **F5.3.3** — Atualizar `components/publish/file-step.tsx` (linha ~119): substituir `getStorageUrl('avatars', storagePath)` por `getAssetUrl(storagePath)` nos previews de edição (coberto pela delegação em F5.3.2)

---

### F5.4 — Migração de arquivos existentes (Supabase → S3)

> Esta etapa pode ser feita após a nova infra estar em produção. Novos uploads já vão direto ao S3; arquivos antigos continuam no Supabase até a migração.

- [x] **F5.4.1** — Escrever script `scripts/migrate-storage-to-s3.ts` que:
  - Lista todos os registros com `storage_path`, `audio_files.storage_path`, `cover_path`, `banner_path` no banco
  - Baixa cada arquivo do Supabase Storage
  - Faz upload para o S3 na chave com prefixo correto
  - Atualiza o path no banco para a nova chave S3

- [ ] **F5.4.2** — Executar o script em staging primeiro, validar URLs, depois em produção

- [ ] **F5.4.3** — Após migração completa e validada: remover a lógica de fallback Supabase de `getAssetUrl()` e limpar env vars do Supabase Storage (`NEXT_PUBLIC_SUPABASE_URL` pode continuar para auth — só o storage é removido do upload path)

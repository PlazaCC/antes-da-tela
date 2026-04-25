# poc-25 — Upload Wizard: alinhamento ao Figma

**Scope:** Frontend  
**Priority:** P4  
**Status:** pending  
**Figma refs:** Step 1 `115:1008`, Step 2 `115:1075`, Step 3 `125:1430`, Step 4 `128:1691`

---

## Referências de qualidade

Os componentes de upload já implementados (FileUploadField/DragZone) são sólidos e bem construídos — **não alterar a lógica de upload**. Esta task é exclusivamente de layout e UX alinhada ao Figma.

---

## O que já está feito ✓

- Wizard de 4 steps com navegação (Voltar/Continuar/Publicar) ✓
- Progress bar com labels das etapas ✓
- Step 1 — InfoStep: Título, Logline, Sinopse ✓
- Step 2 — FileStep: DragZone para PDF, áudio, capa (2:3), banner (16:9) ✓
- Step 3 — GenreStep: seleção de gênero e classificação etária ✓
- Step 4 — ReviewStep: resumo de informações, arquivos e categorias ✓
- Cancel Dialog com detecção de unsaved changes ✓
- Modo de edição (`?id=...`) ✓

---

## Gaps do Figma

### 1. PreviewPanel — painel de prévia persistente (P0 desta task)

O gap mais importante. O Figma mostra em **todos os 4 steps** um painel de prévia fixo do lado direito (452px) que exibe em tempo real como o roteiro vai aparecer na plataforma.

**Estrutura do PreviewPanel (igual em todos os steps):**

```
┌─────────────────────────────────┐
│ "Prévia do roteiro"  (semibold) │
│                                 │
│ [Cover 2:3 — placeholder ou     │
│  imagem se já uploadada]        │
│ "Adicionar capa" (placeholder)  │
│                                 │
│ Título (DM Serif)               │
│ Autor                           │
│                                 │
│ CATEGORIZAÇÃO (mono caps)       │
│ [tags de gênero e classificação]│
│                                 │
│ ─────────────────────────────── │
│                                 │
│ Visibilidade                    │
│ ○ Público  ○ Privado ○ Rascunho │
└─────────────────────────────────┘
```

**Implementação no `publish-page.tsx`:**

Mudar o layout de `max-w-3xl mx-auto` (coluna única) para dois painéis lado a lado no desktop:

```tsx
{/* Container principal */}
<div className="flex flex-col lg:flex-row gap-8 items-start">
  
  {/* FormPanel — flex-1, conteúdo atual do wizard */}
  <div className="flex-1 min-w-0 bg-surface border border-border-default rounded-sm p-5 md:p-8 flex flex-col gap-6">
    {/* steps como antes */}
  </div>

  {/* PreviewPanel — 320px fixo, sticky no desktop */}
  <aside className="hidden lg:flex flex-col w-80 shrink-0 sticky top-24">
    <ScriptPreview
      title={formValues.title}
      genre={formValues.genre}
      ageRating={formValues.ageRating}
      coverFile={coverFile}
      coverStoragePath={formValues.coverStoragePath}
      visibility={formValues.visibility}
      onVisibilityChange={(v) => setValue('visibility', v)}
    />
  </aside>
</div>
```

Criar `components/publish/script-preview.tsx`:

```tsx
export function ScriptPreview({ title, genre, ageRating, coverFile, coverStoragePath, visibility, onVisibilityChange }) {
  const coverUrl = coverFile
    ? URL.createObjectURL(coverFile)
    : coverStoragePath
      ? getStorageUrl('avatars', coverStoragePath)
      : null

  return (
    <div className="bg-surface border border-border-default rounded-sm p-6 flex flex-col gap-6 justify-between h-[560px]">
      <h3 className="font-semibold text-[15px] text-text-primary">Prévia do roteiro</h3>

      {/* Cover + metadata */}
      <div className="flex gap-5">
        {/* Cover 2:3 */}
        <div className="w-[108px] shrink-0 aspect-[2/3] rounded-sm bg-elevated border border-border-subtle overflow-hidden relative flex flex-col items-center justify-center gap-1">
          {coverUrl ? (
            <Image src={coverUrl} alt="Capa" fill className="object-cover" unoptimized />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-text-muted" />
              <span className="font-mono text-[10px] text-text-muted text-center">Adicionar capa</span>
            </>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] text-brand-accent uppercase tracking-wider">
              CATEGORIZAÇÃO
            </span>
            <div className="flex gap-1.5 flex-wrap mt-1">
              {genre && <Tag variant="default">{genre}</Tag>}
              {ageRating && <Tag variant="default">{formatAgeRating(ageRating)}</Tag>}
            </div>
          </div>
        </div>
      </div>

      {/* Title preview */}
      <div className="flex flex-col gap-1">
        <p className="font-display text-[18px] text-text-primary leading-snug line-clamp-2">
          {title || <span className="text-text-muted italic">Título do roteiro</span>}
        </p>
      </div>

      <div className="border-t border-border-subtle" />

      {/* Visibilidade */}
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-[15px] text-text-primary">Visibilidade</span>
        <div className="flex flex-col gap-2">
          {(['public', 'private', 'draft'] as const).map((v) => (
            <label key={v} className="flex items-center gap-3 p-2.5 rounded-sm border border-border-subtle bg-elevated cursor-pointer hover:border-border-default transition-colors">
              <input type="radio" checked={visibility === v} onChange={() => onVisibilityChange(v)} className="accent-brand-accent" />
              <span className="text-body-small text-text-primary capitalize">
                {v === 'public' ? 'Público' : v === 'private' ? 'Privado' : 'Rascunho'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
```

> **Visibilidade no schema:** verificar se o campo `status` em `scripts` já suporta `'draft'` além de `'published'`. Se não, a UI pode apenas controlar se publica imediatamente ou salva como rascunho (sem alterar o schema).

### 2. Título/subtítulo da etapa por step

O Figma mostra abaixo do progress bar um bloco com:
- Título DM Serif 24px: ex. "Informações básicas do roteiro"
- Subtítulo Inter 13px muted: ex. "Etapa 1 de 4 — Preencha os dados principais do seu projeto"

Atualmente o wizard mostra apenas "Publicar Roteiro" como heading da página, sem contexto por step.

**Em `publish-page.tsx`**, substituir o bloco de heading estático por:

```tsx
const STEP_META = [
  { title: 'Informações básicas do roteiro', subtitle: 'Etapa 1 de 4 — Preencha os dados principais do seu projeto' },
  { title: 'Arquivos do projeto', subtitle: 'Etapa 2 de 4 — Faça o upload do PDF e arquivos opcionais' },
  { title: 'Categorização', subtitle: 'Etapa 3 de 4 — Defina o gênero e classificação do roteiro' },
  { title: 'Revisão e publicação', subtitle: 'Etapa 4 de 4 — Revise os dados antes de publicar' },
]

// Antes do FormPanel:
<div className="flex flex-col gap-1.5">
  <h2 className="font-display text-[24px] text-text-primary">{STEP_META[step - 1].title}</h2>
  <p className="text-[13px] text-text-muted">{STEP_META[step - 1].subtitle}</p>
</div>
```

### 3. Logline — contador de caracteres

O Figma mostra "67/160" no canto inferior direito do campo de logline.

**Em `info-step.tsx`**, substituir o `<Input>` do logline por um componente composto com contador:

```tsx
const loglineValue = watch('logline') ?? ''
const MAX_LOGLINE = 160

<div className="flex flex-col gap-2">
  <label ...>Logline</label>
  <div className="relative">
    <Input
      {...register('logline', { maxLength: MAX_LOGLINE })}
      maxLength={MAX_LOGLINE}
      className="bg-elevated pr-16"
    />
    <span className={cn(
      "absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px]",
      loglineValue.length >= MAX_LOGLINE ? "text-state-error" : "text-text-muted"
    )}>
      {loglineValue.length}/{MAX_LOGLINE}
    </span>
  </div>
</div>
```

### 4. Step 2 — PDF com mini-preview do conteúdo no drag zone

O Figma mostra que após o upload do PDF, o drag zone exibe uma miniatura do documento (white card com o texto do script visível, ~302x145px), não apenas o nome do arquivo.

Isso é visualmente impactante mas tecnicamente custoso (requer renderizar a primeira página do PDF via `pdfjs-dist`). Para POC, aceitar uma aproximação: após o upload, mostrar o nome do arquivo + um ícone de documento maior e a contagem de páginas (já disponível via `validatePdfStructure`).

**Escopo para POC:** não implementar o preview de conteúdo do PDF — apenas documentar o gap.

### 5. Step 4 — Review: cover thumbnail na revisão

A tela de revisão atual não mostra a capa. Adicionar a thumbnail da capa junto ao resumo:

**Em `review-step.tsx`**, passar `coverFile` e `coverStoragePath` como props e exibir a miniatura na seção "Informações":

```tsx
{/* Ao lado da seção de Info */}
{(coverFile || coverStoragePath) && (
  <div className="w-16 aspect-[2/3] rounded-sm overflow-hidden shrink-0">
    <Image src={coverUrl!} alt="Capa" width={64} height={96} className="object-cover" />
  </div>
)}
```

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

O Figma mostra o wizard apenas em 1440px com o PreviewPanel ao lado. Em mobile o PreviewPanel some e o wizard ocupa tela inteira. Garantir que toda a experiência de publicação funcione em phone e tablet.

### PreviewPanel — escondido em mobile/tablet

O PreviewPanel só aparece em `lg` (1024px+). Em phone e tablet, o wizard ocupa a largura total:

```tsx
{/* PreviewPanel */}
<aside className="hidden lg:flex flex-col w-80 shrink-0 sticky top-24">
```

Não exibir nenhum summary colapsável do preview em mobile — o ReviewStep (Step 4) cumpre essa função.

### Barra de navegação — sticky bottom no mobile

No mobile, os botões "Voltar" e "Continuar/Publicar" devem ficar fixos no rodapé para que o usuário não precise rolar até o fim do formulário:

```tsx
{/* Mobile: fixed bottom CTA */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-base border-t border-border-subtle px-5 py-4 flex gap-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
  {step > 1 && <Button variant="outline" className="flex-1" onClick={prevStep}>Voltar</Button>}
  <Button className="flex-1" onClick={nextStep}>{step === 4 ? 'Publicar' : 'Continuar'}</Button>
</div>

{/* Padding para não sobrepor conteúdo do form */}
<div className="lg:hidden h-[80px]" />
```

Em desktop (lg+), manter os botões dentro do FormPanel como atualmente.

### Progress bar — compacto no mobile

Em phone, o progress bar com labels de todas as etapas pode ficar apertado. Em <768px, esconder os labels das etapas e mostrar apenas o indicador de progresso + "Etapa X de 4":

```tsx
{/* Labels das etapas: só no tablet+ */}
<div className="hidden md:flex justify-between ...">
  {steps.map(s => <span key={s}>{s}</span>)}
</div>
{/* Resumo compacto no mobile */}
<div className="flex md:hidden justify-between items-center mb-2">
  <span className="font-mono text-label-mono-small text-text-muted">Etapa {step} de 4</span>
  <span className="font-mono text-label-mono-small text-text-muted">{STEP_META[step - 1].title}</span>
</div>
```

### DragZone — touch-friendly

O componente `DragZone` usa `react-dropzone` que já suporta tap-to-select nativamente. Verificar que:
- A área clicável tem `min-h-[88px]` (≥ 2× touch target)
- O texto "ou clique para selecionar" está presente e legível
- Nenhum efeito de hover é a **única** indicação de interatividade (deve haver borda/ícone sempre visíveis)

### Inputs — sem zoom no iOS

Todos os `<Input>` e `<Textarea>` do wizard devem ter `text-base` (16px) para evitar o zoom automático do iOS Safari ao focar:

```tsx
<Input className="min-h-[44px] text-base ..." />
<Textarea className="text-base ..." />
```

### Scroll — sem travamento

No mobile, o formulário deve rolar normalmente pela página. Não usar `overflow-hidden` ou `max-h` no container principal do wizard que impeça o scroll natural do documento.

---

## Arquivos a criar/modificar

| Arquivo | Mudança |
|---|---|
| `components/publish/publish-page.tsx` | Layout split (FormPanel + PreviewPanel), step title/subtitle, max-w `lg:max-w-6xl`, mobile sticky CTA, mobile progress compacto |
| `components/publish/script-preview.tsx` | **Criar** — PreviewPanel com cover, metadata, visibilidade |
| `components/publish/info-step.tsx` | Contador de caracteres no logline, inputs com `text-base min-h-[44px]` |
| `components/publish/review-step.tsx` | Cover thumbnail na revisão |
| `server/api/scripts.ts` | Verificar suporte a `status: 'draft'` se visibilidade for implementada |

---

## Acceptance criteria

- [ ] Desktop (lg+): FormPanel + PreviewPanel lado a lado; PreviewPanel `sticky top-24`
- [ ] Mobile/tablet (<lg): PreviewPanel oculto, wizard ocupa largura total
- [ ] Mobile: botões "Voltar/Continuar" fixos no rodapé com `env(safe-area-inset-bottom)`
- [ ] Mobile: progress bar compacto com "Etapa X de 4" + título sem labels laterais
- [ ] PreviewPanel: cover placeholder "Adicionar capa"; exibe imagem quando cover upada
- [ ] PreviewPanel: título e gênero/classificação aparecem conforme preenchidos no form
- [ ] PreviewPanel: seção "Visibilidade" com RadioBox (Público / Privado / Rascunho)
- [ ] Heading dinâmico por step: título DM Serif + subtítulo com "Etapa X de 4 — ..."
- [ ] Logline: contador "X/160" visível no campo
- [ ] Todos os inputs com `text-base` e `min-h-[44px]` (sem zoom iOS)
- [ ] Review: exibe thumbnail da capa se disponível
- [ ] `yarn build` sem erros de tipo

# poc-24 — Tela do Roteiro: redesign completo

**Scope:** Frontend  
**Priority:** P0  
**Status:** pending  
**Figma refs:** PDF Reader `51:1007`, Modal/Roteiro `51:718`

---

## Referências de qualidade (telas aprovadas — ir além do Figma)

As seguintes telas foram aprovadas e são referência de padrão visual e responsividade:

- **Home** — hero carousel com gradiente + editorial + grid responsivo
- **Perfil público** — banner full-width + avatar sobreposto + tabs
- **Dashboard** — sidebar fixa + conteúdo scrollável

A tela do roteiro deve ter o mesmo nível de acabamento. Trate o Figma como wireframe de alta fidelidade, não como limite visual.

---

## O que já está feito

- Renderização de banner, cover (4/5), título, logline, autor, tags, rating ✓
- Ações do autor (Editar / Excluir) ✓
- PDF viewer com zoom e paginação ✓
- Comments sidebar (desktop, 400px) ✓
- AudioPlayer (desktop, acima do PDF) ✓
- Delete AlertDialog ✓

---

## Gaps a corrigir

### 1. Hero banner — altura e apresentação cinematográfica

O banner atual (`h-48 md:h-64`, `opacity-20`, `absolute`) é muito sutil e não impacta o layout. Deve funcionar como um hero section, igual ao carousel da home.

**Mudança em `script-page-client.tsx`:**

```tsx
{/* Hero Banner */}
<div className="relative w-full h-[280px] md:h-[420px] overflow-hidden bg-elevated">
  {bannerUrl ? (
    <Image src={bannerUrl} alt={script.title} fill priority className="object-cover object-center" />
  ) : (
    <div className="flex items-end justify-start h-full" />
  )}
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/40 to-transparent" />
  {/* Título sobreposto no hero (apenas quando há banner) */}
  {bannerUrl && (
    <div className="absolute bottom-0 left-0 right-0 px-5 md:px-12 pb-8 max-w-6xl mx-auto w-full">
      <h1 className="font-display text-heading-2 md:text-heading-1 text-text-primary leading-tight line-clamp-2">
        {script.title}
      </h1>
      {script.logline && (
        <p className="text-body-default text-text-secondary mt-2 line-clamp-2 max-w-2xl">{script.logline}</p>
      )}
    </div>
  )}
</div>
```

Se não tiver banner: o hero pode ser apenas o `bg-elevated` com o header de metadados logo abaixo (sem espaço desperdiçado).

### 2. Breadcrumbs — navegação de volta à home

Adicionar logo abaixo do NavBar (antes do hero ou entre o hero e o header de metadados):

```tsx
<div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle bg-bg-base">
  <Link href="/" className="font-mono text-label-mono-small text-text-muted hover:text-text-primary transition-colors">
    ← Home
  </Link>
  <span className="text-text-muted font-mono text-label-mono-small">/</span>
  <span className="font-mono text-label-mono-small text-text-secondary truncate max-w-[200px]">
    {script.title}
  </span>
</div>
```

### 3. Header de metadados — fora do hero, abaixo do gradiente

Quando há banner, o título já aparece sobreposto. O bloco de metadados (cover, tags, autor, rating) aparece abaixo do hero em uma seção limpa:

```tsx
<div className="max-w-6xl mx-auto w-full px-5 py-8">
  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
    {/* Cover — só exibir quando NÃO há banner (banner já é o hero) */}
    {!bannerUrl && (
      <div className="w-32 md:w-40 shrink-0 aspect-[4/5] ...">
        {coverUrl ? <Image ... /> : <Film />}
      </div>
    )}
    <div className="flex flex-col gap-4 flex-1 min-w-0">
      {/* Tags, título (quando sem banner), logline, autor, rating */}
    </div>
  </div>
</div>
```

### 4. Sinopse — sempre visível, antes do leitor

A sinopse deve aparecer abaixo dos metadados mesmo quando há PDF. Atualmente fica escondida.

```tsx
{script.synopsis && (
  <div className="max-w-6xl mx-auto w-full px-5 pb-8 border-t border-border-subtle pt-6">
    <h3 className="font-mono text-label-mono-caps text-text-muted uppercase tracking-wider mb-3">
      Sinopse
    </h3>
    <p className="text-body-default text-text-secondary leading-relaxed max-w-3xl">
      {script.synopsis}
    </p>
  </div>
)}
```

### 5. Mobile — audio player fixo no rodapé

```tsx
{/* Desktop: player acima do reader */}
{audioUrl && (
  <div className="hidden lg:block max-w-6xl mx-auto w-full px-5 pb-4">
    <AudioPlayer src={audioUrl} className="max-w-sm" />
  </div>
)}

{/* Mobile: fixo no bottom */}
{audioUrl && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-border-subtle px-4 py-3">
    <AudioPlayer src={audioUrl} />
  </div>
)}
```

Adicionar `pb-[68px]` no `<main>` quando `audioUrl && mobile` para não sobrepor conteúdo.

### 6. Mobile — comments sidebar como Sheet

```tsx
{/* Desktop: sidebar fixa */}
<div className="hidden lg:flex flex-col w-[400px] shrink-0 border-l border-border-subtle">
  <CommentsSidebar scriptId={script.id} currentUserId={currentUserId} />
</div>

{/* Mobile: botão FAB + Sheet */}
<div className="lg:hidden fixed bottom-[68px] right-4 z-20">
  <button
    onClick={() => setCommentsOpen(true)}
    className="flex items-center gap-1.5 px-4 py-2 bg-surface border border-border-subtle font-mono text-label-mono-small text-text-secondary">
    💬 Comentários
  </button>
</div>
<Sheet open={commentsOpen} onOpenChange={setCommentsOpen}>
  <SheetContent side="bottom" className="h-[80vh] p-0">
    <CommentsSidebar scriptId={script.id} currentUserId={currentUserId} />
  </SheetContent>
</Sheet>
```

### 7. Estado "Sem PDF" — mais informativo e bonito

Quando não há PDF disponível, exibir uma tela que comunica isso com design consistente — não o bloco técnico atual com "pages" e "size":

```tsx
<div className="max-w-4xl mx-auto w-full px-5 pb-12 pt-6">
  <div className="rounded-sm border border-border-subtle bg-surface p-8 flex flex-col items-center gap-4 text-center">
    <Film className="w-12 h-12 text-text-muted" />
    <p className="font-mono text-label-mono-caps text-text-muted uppercase tracking-wider">
      PDF não disponível
    </p>
    <p className="text-body-small text-text-secondary max-w-sm">
      O arquivo deste roteiro não está disponível para leitura no momento.
    </p>
  </div>
</div>
```

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

O Figma cobre apenas 1440px. Toda a tela do roteiro deve funcionar bem em phone (<768px) e tablet (768–1023px). Referências de padrão: Home, Perfil público e Dashboard aprovadas.

### Layout geral

- **Phone:** coluna única. Nenhum `flex-row` fixo — tudo empilhado verticalmente.
- **Tablet:** pode usar `md:flex-row` para cover + metadados lado a lado, mas PDF viewer e comments permanecem em coluna única (sem sidebar fixa).
- **Desktop:** `lg:flex-row` com comments sidebar fixa de 400px.

### Hero banner — três breakpoints

Ajustar a altura do hero para três níveis:

```tsx
<div className="relative w-full h-[200px] md:h-[300px] lg:h-[420px] overflow-hidden bg-elevated">
```

No phone, `h-[200px]` é suficiente para impacto visual sem ocupar toda a viewport.

### `min-h-dvh` — viewport units corretas

Usar `min-h-dvh` no `<main>` ao invés de `min-h-screen`. Em iOS Safari o endereço URL + barra de atalhos recolhem durante o scroll — `dvh` respeita a viewport dinâmica.

### Breadcrumbs — truncate no mobile

```tsx
<span className="font-mono text-label-mono-small text-text-secondary truncate max-w-[140px] md:max-w-[280px]">
  {script.title}
</span>
```

### PDF viewer — touch targets

Todos os botões de controle do PDF viewer (zoom +/-, navegação de página, toggle fullscreen) devem ter tamanho mínimo de toque de 44×44px:

```tsx
<button className="w-11 h-11 flex items-center justify-center ...">
```

Garantir `touch-action: manipulation` nos botões para eliminar o delay de 300ms do iOS.

### Safe-area para audio fixo no bottom

O audio player fixo no rodapé deve respeitar a safe area do iPhone (home indicator):

```tsx
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-border-subtle px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
```

O `<main>` deve receber padding correspondente:

```tsx
className={cn("flex-1", audioUrl && "pb-[calc(68px+env(safe-area-inset-bottom))]")}
```

### FAB de comentários — touch target

O botão "Comentários" no mobile deve ter `min-h-[44px]`:

```tsx
<button className="flex items-center gap-1.5 px-4 min-h-[44px] bg-surface border border-border-subtle ...">
```

### Scroll aninhado — remover

O `CommentsSidebar` atual usa `max-h-[90vh]` internamente — isso cria dois scrolls simultâneos no mobile, o que é um anti-pattern. No Sheet mobile, o scroll deve ser da Sheet inteira, não do conteúdo interno. Remover qualquer `max-h` explícito dentro do sidebar quando em contexto de Sheet.

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `app/scripts/[id]/script-page-client.tsx` | Hero banner, breadcrumbs, metadados, sinopse, mobile audio, mobile comments, estado sem PDF, mobile layout |
| `components/pdf-viewer/comments-sidebar.tsx` | Remover `max-h` explícito (controlado pelo Sheet no mobile) |

---

## Acceptance criteria

- [ ] Hero banner: `h-[200px] md:h-[300px] lg:h-[420px]`, gradiente bottom-to-top, título sobreposto quando `bannerUrl` presente
- [ ] Breadcrumbs visíveis: "← Home / Título do Roteiro" com truncate no mobile
- [ ] Sinopse exibida abaixo dos metadados mesmo quando PDF presente
- [ ] Mobile: audio player fixo no rodapé com `env(safe-area-inset-bottom)` correto
- [ ] Mobile: botão "Comentários" abre Sheet `h-[80vh]` com `CommentsSidebar`, sem scroll aninhado
- [ ] Mobile: todos os botões de controle do PDF ≥44×44px com `touch-action: manipulation`
- [ ] Estado sem PDF: UI informativa e consistente com o design system
- [ ] Layout: phone = coluna única, tablet = cover+info lado a lado, desktop = com sidebar
- [ ] `min-h-dvh` no `<main>` (não `min-h-screen`)
- [ ] `yarn build` sem erros de tipo

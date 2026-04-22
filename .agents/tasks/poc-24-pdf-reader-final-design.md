# poc-24 — PDF Reader: mobile + breadcrumbs

**Scope:** Frontend  
**Priority:** P1  
**Status:** pending  
**Figma:** PDF Reader `51:1007`

---

## O que já está feito

- PDF viewer com zoom e navegação por página ✓
- Controls bar (PageController + ZoomController) flutuando no topo ✓
- Comments sidebar com Avatar, ReactionBar, formulário de comentário ✓
- Audio player acima do PDF quando `audioUrl` presente ✓

---

## Gaps

### 1. Breadcrumbs bar (abaixo do Header)

O Figma mostra uma barra logo abaixo do Header com o logo + título do roteiro como breadcrumb.

**Arquivo:** `app/scripts/[id]/script-page-client.tsx`

Adicionar antes do bloco do reader:
```tsx
{/* Breadcrumbs (ref: Figma 51:1009) */}
<div className="flex items-center gap-3 px-5 py-3 bg-surface border-b border-border-subtle">
  <Logo className="h-5 w-auto" />  {/* ou texto "Antes da Tela" */}
  <span className="text-body-small text-text-muted">/</span>
  <span className="text-body-small text-text-secondary truncate">{script.title}</span>
</div>
```

### 2. Mobile — Audio player fixo no rodapé

No mobile, o audio player deve ficar fixo no rodapé da tela (não acima do PDF). O PDF ocupa a tela inteira e o player aparece como barra persistente na parte inferior.

**Arquivo:** `app/scripts/[id]/script-page-client.tsx`

- Remover o bloco atual `{audioUrl && <AudioPlayer ... />}` (que renderiza acima do PDF no desktop e mobile)
- Desktop: manter o player acima do PDF (posição atual)
- Mobile (< `lg`): renderizar `<AudioPlayer>` como elemento `fixed bottom-0 left-0 right-0 z-20` dentro de um portal ou no fim do layout

Sugestão de estrutura:
```tsx
{/* Desktop: player acima do PDF */}
{audioUrl && (
  <div className="hidden lg:block max-w-6xl mx-auto w-full px-5 pb-4">
    <AudioPlayer src={audioUrl} className="max-w-sm" />
  </div>
)}

{/* Reader area */}
<div className="flex flex-col lg:flex-row ...">
  {/* PDF + sidebar */}
</div>

{/* Mobile: player fixo no rodapé */}
{audioUrl && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-border-subtle px-4 py-3">
    <AudioPlayer src={audioUrl} />
  </div>
)}
```

### 3. Mobile — Comments sidebar como Sheet

No mobile a sidebar de 400px não cabe na tela. Ela deve ser acessada via um botão flutuante ou aba.

**Arquivo:** `app/scripts/[id]/script-page-client.tsx` + `components/pdf-viewer/comments-sidebar.tsx`

- Desktop (≥ `lg`): manter sidebar fixa de 400px (comportamento atual)
- Mobile (< `lg`): ocultar sidebar fixa; adicionar botão FAB ou aba "Comentários (N)" que abre um `Sheet` (shadcn, `side="bottom"`) contendo o `CommentsSidebar`
- O `Sheet` de comentários ocupa `h-[80vh]` (mesmo padrão do SearchSheet)

Exemplo de trigger mobile:
```tsx
{/* Mobile comment trigger */}
<div className="lg:hidden fixed bottom-[64px] right-4 z-20">
  {/* 64px = altura do audio player fixo */}
  <button onClick={() => setCommentsOpen(true)} className="...">
    💬 {comments.length}
  </button>
</div>
```

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `app/scripts/[id]/script-page-client.tsx` | Breadcrumbs bar + layout mobile player fixo + trigger para sheet de comentários |
| `components/pdf-viewer/comments-sidebar.tsx` | Nenhum — lógica permanece; apenas o wrapper muda para Sheet no mobile |

---

## Acceptance criteria

- [ ] Breadcrumbs bar visível abaixo do Header: logo (ou texto) + "/" + título do roteiro
- [ ] Desktop: audio player acima do PDF como antes; sidebar de comentários fixa 400px
- [ ] Mobile: audio player fixo no rodapé da tela quando `audioUrl` presente
- [ ] Mobile: sidebar de comentários oculta; botão abre Sheet com `CommentsSidebar`
- [ ] `yarn build` sem erros de tipo

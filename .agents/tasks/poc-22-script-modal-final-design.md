# poc-22 — Modal Preview: audio player no sidebar

**Scope:** Frontend  
**Priority:** P3  
**Status:** pending  
**Figma:** Modal/Roteiro `51:718`

---

## O que já está feito ✓

- Layout dois painéis (sidebar + main content) ✓
- Sidebar com cover placeholder `aspect-[4/5]` ou imagem ✓
- CloseButton, título DM Serif Display ✓
- AuthorSection com Avatar + FollowButton ✓
- Tags (gênero, age rating), StatsSection, Logline, Sinopse ✓
- Botão "Ler Roteiro" na sidebar ✓

---

## Único gap restante

### Audio player no sidebar do modal

O Figma mostra o `AudioPlayer` abaixo da capa no sidebar. Atualmente o sidebar (`components/script-preview-modal/sidebar.tsx`) não exibe o player.

**`components/script-preview-modal/sidebar.tsx`:**

1. Adicionar prop `audioUrl?: string | null`
2. Após o bloco da capa e antes dos metadados, renderizar o player:

```tsx
{audioUrl && (
  <div className="w-full">
    <AudioPlayer src={audioUrl} />
  </div>
)}
```

**`components/script-preview-modal/script-preview-modal.tsx`:**

Verificar que o endpoint `scripts.getById` retorna `audio_url` (URL pública já resolvida).
Se não retornar, adicionar ao select e resolver server-side dentro do tRPC router.
Passar `audioUrl` como prop para `<ModalSidebar>`.

---

## Mobile & Tablet (Figma é desktop-only — especificação adicional)

O modal de preview já tem tratamento responsivo básico (dois painéis → coluna única). Garantir que funcione bem em phone e tablet.

### Modal — tamanho no mobile

Em phone (<768px), o modal deve ocupar quase toda a tela. Verificar que o `DialogContent` ou `SheetContent` use:

```tsx
className="w-full max-w-full sm:max-w-2xl h-[90dvh] sm:h-auto overflow-y-auto"
```

Usar `dvh` ao invés de `vh` para respeitar a barra de endereço dinâmica do iOS Safari.

### Layout — empilhado no mobile

No phone, o sidebar (cover, author, stats) deve aparecer **acima** do conteúdo principal (logline, sinopse). Nenhum `flex-row` fixo sem breakpoint:

```tsx
<div className="flex flex-col md:flex-row h-full">
  <ModalSidebar ... />   {/* aparece primeiro no mobile */}
  <ModalMain ... />
</div>
```

### AudioPlayer — empilhado abaixo da cover no mobile

No layout de coluna única do mobile, o `<AudioPlayer>` fica naturalmente abaixo da cover (pois está no sidebar que vem primeiro). Garantir que o player tenha `w-full` para ocupar a largura disponível na coluna.

### Botão de fechar — touch target

O botão de fechar o modal deve ter área mínima de toque de 44×44px:

```tsx
<button className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center ...">
  <X className="w-4 h-4" />
</button>
```

### Botão "Ler Roteiro" — touch target

O CTA principal deve ter `min-h-[44px]`. O shadcn `<Button>` padrão já tem altura adequada, mas confirmar que não foi reduzido via `size="sm"`.

---

## Arquivos a modificar

| Arquivo | Mudança |
|---|---|
| `components/script-preview-modal/sidebar.tsx` | Prop `audioUrl` + renderizar `<AudioPlayer>` abaixo da cover com `w-full` |
| `components/script-preview-modal/script-preview-modal.tsx` | Buscar e passar `audioUrl`, verificar `h-[90dvh]` no mobile, botão fechar ≥44px |
| `server/api/scripts.ts` | Se necessário: `getById` retornar `audio_url` resolvido |

---

## Acceptance criteria

- [ ] Sidebar do modal exibe `<AudioPlayer>` abaixo da capa quando script tem áudio
- [ ] Sem áudio: bloco ausente, sem espaço vazio
- [ ] Mobile (<768px): modal ocupa `h-[90dvh]`, layout empilhado (sidebar primeiro)
- [ ] Mobile: botão de fechar com área ≥44×44px
- [ ] Mobile: AudioPlayer com `w-full` na coluna única
- [ ] Desktop (≥768px): dois painéis lado a lado, sidebar fixo
- [ ] `yarn build` sem erros de tipo

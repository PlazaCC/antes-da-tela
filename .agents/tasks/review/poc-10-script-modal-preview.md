---
title: "Script preview modal from home/search results"
type: frontend
priority: P1
branch: feature/script-modal-preview
---

## Objective
Implement the `Modal/Roteiro` screen from Figma: a preview modal/sheet that opens when a user clicks a `ScriptCard` on the home page, showing logline, synopsis, genre, author, rating, and a CTA to open the full reader — without navigating away.

## Context
- Figma frame: `Modal/Roteiro` (nodeId `51:718`), asset at `.agents/figma/screens/modal/Roteiro.png`
- `ScriptCard` at `components/ui/script-card.tsx` currently links directly to `/scripts/[id]`
- `Dialog` shadcn component available at `components/ui/dialog.tsx`
- tRPC endpoint `scripts.getById` can fetch full details on demand
- `StarRating` component at `components/ui/star-rating.tsx`

## Steps
1. Create `components/script-preview-modal/script-preview-modal.tsx` — Dialog wrapping script metadata (title, logline, synopsis, genre Tag, age rating, author avatar+name, StarRating average, page count) with a "Ler roteiro" button linking to `/scripts/[id]`; fetch detail lazily via `useQuery(trpc.scripts.getById)` triggered on dialog open.
2. Wire `ScriptCard` to accept an `onPreview?: () => void` prop; update `HomeClient` to render `ScriptPreviewModal` alongside the grid and pass the selected script id.
3. Ensure modal is keyboard-accessible (focus trap via Dialog), closes on Escape, and shows a Skeleton while loading.

## Acceptance criterion
`yarn build` passes; clicking a ScriptCard on `/` opens the modal with correct data and the "Ler roteiro" CTA navigates to the full reader.

## Artifacts
- `components/script-preview-modal/script-preview-modal.tsx`
- `components/script-preview-modal/index.ts`
- Updated `components/ui/script-card.tsx` (onPreview prop)
- Updated `app/home-client.tsx`

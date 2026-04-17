---
title: "Wire ReactionBar to tRPC for comment reactions"
type: backend
priority: P2
branch: feature/comment-reactions
---

## Objective
Back the existing `ReactionBar` UI component with a DB table and tRPC endpoints so users can react to comments (e.g., thumbs-up, heart, fire) and reaction counts persist across sessions.

## Context
- `components/ui/reaction-bar.tsx` is a complete UI component accepting `reactions[]` and `onSelect` props — not yet connected to any API
- `Reaction` figmaNodeId `13:114`, `ReactionBar` figmaNodeId `13:132` — seção `Fluxo principal` (186:1388), tela `PDF Reader` (51:1007)
- Buscar specs via `mcp__Framelink_Figma_MCP__get_figma_data(fileKey="iUb8odefGSZiHz4KjuzX1M", nodeId="13:132")`
- Assets locais (SVGs/PNGs) foram removidos — usar Framelink MCP como fonte de referência visual
- DB schema has no `reactions` table yet — needs Drizzle schema addition + migration
- `commentsRouter` in `server/api/comments.ts` is the natural home for a `reactions` sub-router or new `reactionsRouter`
- Soft-delete discipline: use `upsert` (toggle) pattern: if reaction exists → delete, if not → insert

## Steps
1. Add `comment_reactions` table to `server/db/schema.ts`: `id uuid pk`, `comment_id uuid FK comments.id`, `user_id uuid FK users.id`, `emoji text` (e.g., "👍"), `created_at timestamp`; add `uniqueIndex('comment_reactions_unique').on(table.commentId, table.userId, table.emoji)`. Run `yarn drizzle:generate` and apply migration.
2. Add `reactions` sub-procedures to `commentsRouter`: `toggle` (authenticatedProcedure — upsert/delete by emoji+commentId), `listByComment` (publicProcedure — returns `{ emoji, count, userReacted }[]` for a given comment id and optional userId).
3. Update `CommentsSidebar` to fetch reactions per comment via `trpc.comments.listReactions` and render `ReactionBar`; call `trpc.comments.toggle` on `onSelect` with TanStack Query invalidation.

## Acceptance criterion
`yarn build` passes; authenticated user can toggle a reaction on a comment and the count updates in the sidebar without page reload.

## Artifacts
- Updated `server/db/schema.ts` (comment_reactions table)
- New Drizzle migration in `drizzle/`
- Updated `server/api/comments.ts` (toggle, listReactions)
- Updated `components/pdf-viewer/comments-sidebar.tsx`

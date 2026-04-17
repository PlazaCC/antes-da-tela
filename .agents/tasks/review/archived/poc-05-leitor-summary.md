# poc-05-leitor — Archived

**Original title:** [Leitor] - PDF viewer com comentários ancorados por página

## What was done
`PDFViewer` component loaded via `next/dynamic` with `ssr: false` (`components/pdf-viewer/pdf-viewer.tsx`). Zustand store (`components/pdf-viewer/pdf-viewer-store.ts`) controls `currentPage`, `totalPages`, zoom, and sidebar state shared between viewer and sidebar. `CommentsSidebar` (`components/pdf-viewer/comments-sidebar.tsx`) auto-fetches comments when page changes. Authenticated users can create comments inline; unauthenticated users see a login CTA. `commentsRouter` in `server/api/comments.ts` with `list`, `create`, `delete` (soft delete via `deleted_at`). Router registered in `server/api/root.ts`. User avatars displayed in comments (PR #9).

## Relevant paths
- `components/pdf-viewer/pdf-viewer.tsx`
- `components/pdf-viewer/pdf-viewer-store.ts`
- `components/pdf-viewer/comments-sidebar.tsx`
- `components/pdf-viewer/index.tsx`
- `server/api/comments.ts`
- `app/scripts/[id]/script-page-client.tsx`

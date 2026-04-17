# poc-04-upload — Archived

**Original title:** [Upload] - Formulário de publicação e upload de PDF

## What was done
Multi-step publish form (`app/(authenticated)/publish/page.tsx`) with 4 steps: Informações, Arquivo, Categorias, Revisão — matches Figma upload flow screens. Client-side upload to Supabase Storage `scripts` bucket with progress indicator. PDF validation (type + 50MB max). `scriptsRouter` in `server/api/scripts.ts` registers all 6 endpoints: `create`, `getById`, `listRecent`, `listFeatured`, `listByAuthor`, `search`. Script detail page at `app/scripts/[id]/page.tsx` with `ScriptPageClient`. Router registered in `server/api/root.ts`.

## Relevant paths
- `app/(authenticated)/publish/page.tsx`
- `app/scripts/[id]/page.tsx`
- `app/scripts/[id]/script-page-client.tsx`
- `server/api/scripts.ts`
- `server/api/root.ts`

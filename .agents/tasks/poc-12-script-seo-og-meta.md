---
title: "Dynamic OG meta and SEO for script detail pages"
type: frontend
priority: P1
branch: feature/script-seo-og-meta
---

## Objective
Add dynamic `metadata` export to `app/scripts/[id]/page.tsx` so each script page has a unique Open Graph title, description (logline), and og:image (banner), improving discoverability via social sharing.

## Context
- `app/scripts/[id]/page.tsx` currently exports no `metadata`
- Supabase Storage `getPublicUrl` resolves the banner image server-side
- Next.js App Router supports `generateMetadata` async function for dynamic metadata
- `app/opengraph-image.png` and `app/twitter-image.png` exist as fallback OG images
- `scripts.getById` returns `title`, `logline`, `synopsis`, `genre`, `banner_path`, `script_files`

## Steps
1. Add `generateMetadata` export to `app/scripts/[id]/page.tsx` that calls `scripts.getById` and returns `{ title, description, openGraph: { title, description, images } }` — resolve `banner_path` via `ctx.supabase.storage.from('scripts').getPublicUrl(bannerPath)` server-side; fall back to `/opengraph-image.png` if no banner.
2. Add `metadataBase` in `app/layout.tsx` pointing to `process.env.NEXT_PUBLIC_APP_URL ?? 'https://antes-da-tela.vercel.app'`.
3. Add `NEXT_PUBLIC_APP_URL` to `.env.example` with placeholder value.

## Acceptance criterion
- [x] `yarn build` passes; `curl https://<host>/scripts/<id>` response HTML contains `<meta property="og:title"` with the script's actual title.

## Artifacts
- Updated `app/scripts/[id]/page.tsx` (generateMetadata)
- Updated `app/layout.tsx` (metadataBase)
- Updated `.env.example`

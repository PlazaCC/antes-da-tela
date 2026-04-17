---
title: "Apply storage migrations and configure CORS for PDF buckets"
type: infra
priority: P0
branch: feature/storage-cors-buckets
---

## Objective
Apply the pending storage SQL migration to Supabase, create the `scripts`, `audio`, and `avatars` buckets with correct RLS INSERT policies, and configure CORS on the `scripts` bucket so the PDF viewer can load files from `localhost:3000` and `*.vercel.app`.

## Context
- Migration file: `drizzle/0004_storage_buckets_public.sql` sets `public = true` on existing buckets but does not CREATE them or set RLS policies
- Supabase CLI is required for all writes (MCP is read-only): `npx --yes supabase@latest db query --linked`
- PDF viewer CORS error blocks `lei-6` acceptance criterion (storage bucket CORS)
- Upload path convention: `{userId}/{timestamp}_{sanitized_filename}` enforced by INSERT policy `storage.foldername(name)[1] = auth.uid()`
- Bucket config from `poc-context.json`: `scripts` (50MB, PDF), `audio` (100MB, audio/*), `avatars` (5MB, image/*)

## Steps
1. Create a SQL file `supabase/migrations/0001_create_storage_buckets.sql` that: inserts buckets `scripts`, `audio`, `avatars` with `public = true` and file size limits; adds INSERT policy on `storage.objects` for each bucket enforcing `storage.foldername(name)[1] = auth.uid()`. Apply via `npx supabase@latest db query --linked --file supabase/migrations/0001_create_storage_buckets.sql`.
2. Configure CORS on the `scripts` bucket via Supabase dashboard (Storage > Bucket > CORS) or CLI: allow `GET` from `http://localhost:3000`, `https://*.vercel.app`, `https://antes-da-tela.vercel.app`.
3. Verify by uploading a test PDF in the publish flow and loading it in the PDF viewer without CORS errors; confirm buckets appear in Supabase dashboard.

## Acceptance criterion
`yarn dev` + upload a PDF + open `/scripts/[id]` — PDF loads in viewer with no CORS errors in the browser console.

## Artifacts
- `supabase/migrations/0001_create_storage_buckets.sql`
- `drizzle/0004_storage_buckets_public.sql` (already exists, may need amendments)

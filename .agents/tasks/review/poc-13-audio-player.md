---
title: "Audio player on script reader page"
type: frontend
priority: P2
branch: feature/audio-player
---

## Objective
Integrate the `Player` Figma component into the script reader page (`/scripts/[id]`), allowing authors to upload an optional audio file (narration/reading) and readers to play it while reading the PDF.

## Context
- Figma component: `Player` (`.agents/figma/components/Player.svg`) shown in the `PDF Reader` screen (`.agents/figma/screens/PDF Reader.png`)
- DB schema already has `audio_files` table with `script_id`, `storage_path`, `duration_seconds`
- `audioFiles` Supabase bucket defined in `poc-context.json` (public, 100MB, audio/*)
- `scriptsRouter.getById` returns `script_files` — extend to also return `audio_files`
- Upload must be client-side only (Vercel 10s server timeout)

## Steps
1. Create `components/audio-player/audio-player.tsx` — an HTML5 `<audio>` wrapper with play/pause, seek bar (Progress component from `components/ui/progress.tsx`), duration display, and volume control matching the Figma Player design; accept `src: string` and `durationSeconds?: number` props.
2. Add audio upload step to `app/(authenticated)/publish/page.tsx` (optional step after PDF upload): DragZone accepting `audio/*`, uploads to `audio` bucket at `{userId}/{timestamp}_{filename}`, then calls a new `scripts.addAudioFile` tRPC mutation that inserts into `audio_files`.
3. Render `AudioPlayer` in `ScriptPageClient` if `script.audio_files[0]` is present, resolving the public URL server-side in `app/scripts/[id]/page.tsx` and passing it as `audioUrl` prop.

## Acceptance criterion
`yarn build` passes; a script with an uploaded audio file shows the player on `/scripts/[id]`; the player plays without errors.

## Artifacts
- `components/audio-player/audio-player.tsx`
- `components/audio-player/index.ts`
- Updated `server/api/scripts.ts` (addAudioFile mutation, audio_files in getById)
- Updated `app/(authenticated)/publish/page.tsx`
- Updated `app/scripts/[id]/page.tsx` and `script-page-client.tsx`

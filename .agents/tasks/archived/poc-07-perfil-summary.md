# poc-07-perfil — Archived

**Original title:** [Perfil] - Página pública do roteirista e avaliações

## What was done
Public profile page at `app/profile/[userId]/page.tsx` with `ProfileClient` — accessible without login, server-side prefetch of user + scripts. Account settings page at `app/(authenticated)/account/page.tsx` allows editing name, bio, and avatar upload to `avatars` bucket. `ratingsRouter` (`server/api/ratings.ts`) with `upsert` (self-rating returns `FORBIDDEN`), `getAverage`, and `getUserRating`. `onConflictDoUpdate` on `(script_id, user_id)` for upsert. `StarRating` component with TanStack Query invalidation for real-time average update. All routers registered in `server/api/root.ts`.

## Relevant paths
- `app/profile/[userId]/page.tsx`
- `app/profile/[userId]/profile-client.tsx`
- `app/(authenticated)/account/page.tsx`
- `server/api/ratings.ts`
- `components/ui/star-rating.tsx`
- `server/api/root.ts`

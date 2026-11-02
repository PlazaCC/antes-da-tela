import { getPrivateAssetUrl } from '@/lib/storage/private-url'
import type { CastingCharacter, CastingTake, CharacterCasting } from '@/lib/types/casting'
import { toCallCharacter } from '@/server/services/calls.mappers'

/* eslint-disable @typescript-eslint/no-explicit-any -- PostgREST rows are untyped here; mapped to typed shapes below. */
export type Row = Record<string, any>
const one = (value: unknown): Row => (Array.isArray(value) ? value[0] : value) as Row

export const TAKE_COLUMNS =
  'id, character_id, interpreter_id, media_path, media_type, duration_seconds, note, status, ' +
  'interpreter:users!casting_submissions_interpreter_id_users_id_fk(name, display_name, image)'

/** Characters of approved entries of a call (inner join on the entry). */
export const CHARACTER_COLUMNS =
  'id, name, description, apparent_age, gender, traits, modalities, reference, sort_order, ' +
  'entry:call_entries!inner(id, call_id, status, script:scripts(id, title, author:users!scripts_author_id_users_id_fk(name, display_name)))'

export async function toTake(row: Row): Promise<CastingTake> {
  const interpreter = one(row.interpreter)
  return {
    id: row.id,
    interpreterId: row.interpreter_id,
    interpreterName: interpreter?.display_name || interpreter?.name || '',
    interpreterImage: interpreter?.image ?? null,
    mediaUrl: await getPrivateAssetUrl(row.media_path),
    mediaType: row.media_type,
    durationSeconds: row.duration_seconds,
    note: row.note,
    status: row.status,
  }
}

export function toCastingCharacter(row: Row): CastingCharacter {
  const entry = one(row.entry)
  const script = one(entry?.script)
  const author = one(script?.author)
  return {
    ...toCallCharacter(row),
    entryId: entry.id,
    scriptId: script?.id,
    scriptTitle: script?.title ?? '',
    authorName: author?.display_name || author?.name || '',
  }
}

/** Groups takes under their characters, keeping the characters' order. */
export async function withTakes(characters: Row[], takes: Row[]): Promise<CharacterCasting[]> {
  const mapped = await Promise.all(takes.map(async (take) => ({ characterId: take.character_id as string, take: await toTake(take) })))
  return characters.map((row) => ({
    ...toCastingCharacter(row),
    takes: mapped.filter((t) => t.characterId === row.id).map((t) => t.take),
  }))
}
/* eslint-enable @typescript-eslint/no-explicit-any */

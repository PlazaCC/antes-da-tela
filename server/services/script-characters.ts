import type { CharacterInput } from "@/lib/validators/scripts";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";

/** Dedupes traits case-insensitively, keeping the first spelling. */
function normalizeTraits(traits: string[] = []) {
  const seen = new Set<string>();
  return traits.filter((trait) => {
    const key = trait.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Replaces the whole cast of a script with `characters` (replace-set, like
 * audio_files). RLS limits writes to the script's author.
 */
export async function replaceScriptCharacters(
  supabase: SupabaseClient,
  scriptId: string,
  characters: CharacterInput[],
) {
  const { error: deleteError } = await supabase
    .from("script_characters")
    .delete()
    .eq("script_id", scriptId);

  if (deleteError) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Characters reset failed: ${deleteError.message}`,
    });
  }

  if (characters.length === 0) return;

  const { error } = await supabase.from("script_characters").insert(
    characters.map((character, index) => ({
      script_id: scriptId,
      name: character.name,
      description: character.description || null,
      apparent_age: character.apparentAge || null,
      gender: character.gender || null,
      traits: normalizeTraits(character.traits),
      sort_order: index,
    })),
  );

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Characters insert failed: ${error.message}`,
    });
  }
}

/** Most used traits matching `query` (see search_character_traits RPC). */
export async function searchCharacterTraits(
  supabase: SupabaseClient,
  query: string,
  limit: number,
) {
  const { data, error } = await supabase.rpc("search_character_traits", {
    search: query,
    max_results: limit,
  });

  if (error) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
  }

  return ((data ?? []) as { trait: string; uses: number }[]).map((row) => ({
    trait: row.trait,
    uses: Number(row.uses),
  }));
}

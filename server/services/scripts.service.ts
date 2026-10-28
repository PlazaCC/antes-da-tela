import { getAssetUrl } from "@/lib/storage/url";
import { removeAssets } from "@/lib/storage/remove";
import type {
  DashboardMetrics,
  ScriptDetail,
  ScriptListItem,
} from "@/lib/types";
import type {
  ScriptCreateInput,
  ScriptUpdateInput,
} from "@/lib/validators/scripts";
import { getScriptPublishDefaults } from "@/server/domain/scripts";
import { replaceScriptCharacters } from "@/server/services/script-characters";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TRPCError } from "@trpc/server";

export class ScriptsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Guards publication (status = 'published'). The author (the session user)
   * must have an identity document on their profile. Cadastro as draft
   * bypasses this entirely. RLS only exposes the caller's own document.
   */
  private async assertPublishable(userId: string) {
    const { data: document } = await this.supabase
      .from("user_documents")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!document) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Para publicar, cadastre um documento de identificação no seu perfil.",
      });
    }
  }

  async create(
    input: ScriptCreateInput,
    userId: string,
  ) {
    const {
      status,
      storagePath,
      fileSize,
      pageCount,
      ageRating,
      bnRegistration,
      bannerPath,
      coverPath,
      pitchDeckPath,
      audios,
      characters,
      ...scriptData
    } = input;

    // The author's `users` row is guaranteed by authenticatedProcedure
    // (getAppUser creates/links it on first sign-in).

    // Publishing requires the author's identity document.
    // Cadastro as draft is always allowed.
    const isDraft = status === "draft";
    if (!isDraft) {
      await this.assertPublishable(userId);
    }

    // Insert script row
    const { data: script, error: scriptError } = await this.supabase
      .from("scripts")
      .insert({
        ...scriptData,
        age_rating: ageRating ?? null,
        bn_registration: bnRegistration ?? null,
        banner_path: bannerPath ?? null,
        cover_path: coverPath ?? null,
        pitch_deck_path: pitchDeckPath ?? null,
        author_id: userId,
        ...(isDraft
          ? { status: "draft", published_at: null }
          : getScriptPublishDefaults()),
      })
      .select("id, title")
      .single();

    if (scriptError || !script) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: scriptError?.message ?? "Failed to create script",
      });
    }

    // Insert associated script file
    const { error: fileError } = await this.supabase
      .from("script_files")
      .insert({
        script_id: script.id,
        storage_path: storagePath,
        file_size: fileSize ?? null,
        page_count: pageCount ?? null,
      });

    if (fileError) {
      await this.supabase.from("scripts").delete().eq("id", script.id);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: fileError.message,
      });
    }

    if (audios && audios.length > 0) {
      await this.supabase.from("audio_files").insert(
        audios.map((audio, index) => ({
          script_id: script.id,
          storage_path: audio.storagePath,
          title: audio.title,
          description: audio.description ?? null,
          sort_order: index,
          duration_seconds: audio.durationSeconds ?? null,
        })),
      );
    }

    if (characters && characters.length > 0) {
      try {
        await replaceScriptCharacters(this.supabase, script.id, characters);
      } catch (error) {
        // Roll back so a retry doesn't leave a half-created script behind.
        await this.supabase.from("scripts").delete().eq("id", script.id);
        throw error;
      }
    }

    return script;
  }

  async addAudioFile(
    scriptId: string,
    storagePath: string,
    userId: string,
    durationSeconds?: number,
  ) {
    const { data: script } = await this.supabase
      .from("scripts")
      .select("author_id")
      .eq("id", scriptId)
      .single();

    if (!script || script.author_id !== userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not the script author",
      });
    }

    const { error } = await this.supabase.from("audio_files").insert({
      script_id: scriptId,
      storage_path: storagePath,
      duration_seconds: durationSeconds ?? null,
    });

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
  }

  async update(input: ScriptUpdateInput & { authorId: string }) {
    const {
      id,
      authorId,
      storagePath,
      fileSize,
      pageCount,
      pitchDeckPath,
      audios,
      characters,
      ...updateData
    } = input;

    // Check ownership and get old file paths for cleanup
    const { data: oldData, error: fetchError } = await this.supabase
      .from("scripts")
      .select(
        "author_id, status, bn_registration, cover_path, banner_path, script_files(storage_path), audio_files(id, storage_path)",
      )
      .eq("id", id)
      .single();

    if (fetchError || !oldData) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Script not found" });
    }

    if (oldData.author_id !== authorId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not the script author",
      });
    }

    // Enforce publish gating when the resulting status is 'published'.
    const finalStatus = updateData.status ?? oldData.status;
    if (finalStatus === "published") {
      await this.assertPublishable(authorId);
    }

    // Map camelCase to snake_case for Supabase
    const mappedData: Record<string, unknown> = {};
    if (updateData.title) mappedData.title = updateData.title;
    if (updateData.logline) mappedData.logline = updateData.logline;
    if (updateData.synopsis) mappedData.synopsis = updateData.synopsis;
    if (updateData.genre) mappedData.genre = updateData.genre;
    if (updateData.subgenres !== undefined)
      mappedData.subgenres = updateData.subgenres;
    if (updateData.ageRating) mappedData.age_rating = updateData.ageRating;
    if (updateData.bnRegistration !== undefined)
      mappedData.bn_registration = updateData.bnRegistration;
    if (updateData.status) mappedData.status = updateData.status;
    // Stamp published_at the first time a script becomes published.
    if (finalStatus === "published" && oldData.status !== "published") {
      mappedData.published_at = new Date().toISOString();
    }
    if (updateData.bannerPath !== undefined)
      mappedData.banner_path = updateData.bannerPath;
    if (updateData.coverPath !== undefined)
      mappedData.cover_path = updateData.coverPath;
    if (pitchDeckPath !== undefined)
      mappedData.pitch_deck_path = pitchDeckPath;

    // Guard: no fields to update — return early instead of sending an empty UPDATE
    if (Object.keys(mappedData).length === 0) {
      return { id };
    }

    const { error: updateError } = await this.supabase
      .from("scripts")
      .update(mappedData)
      .eq("id", id);

    if (updateError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Update failed: ${updateError.message}`,
      });
    }

    // ── Storage Cleanup ───────────────────────────────────────────────────────
    // Delete old files from storage buckets only if they were replaced by new ones
    const cleanupPromises: Promise<void>[] = [];

    // 1. PDF File
    const oldPdfPath = oldData.script_files?.[0]?.storage_path;
    if (storagePath && oldPdfPath && storagePath !== oldPdfPath) {
      cleanupPromises.push(
        removeAssets(this.supabase, "scripts", [oldPdfPath]),
      );
    }

    // 2. Audio Files (replace-set) — remove storage objects no longer referenced.
    if (audios !== undefined) {
      const newAudioPaths = new Set(audios.map((a) => a.storagePath));
      const removedAudioPaths = (oldData.audio_files ?? [])
        .map((a) => a.storage_path)
        .filter((path): path is string => !!path && !newAudioPaths.has(path));
      if (removedAudioPaths.length > 0) {
        cleanupPromises.push(
          removeAssets(this.supabase, "audio", removedAudioPaths),
        );
      }
    }

    // 3. Cover Image
    if (
      updateData.coverPath !== undefined &&
      oldData.cover_path &&
      updateData.coverPath !== oldData.cover_path
    ) {
      cleanupPromises.push(
        removeAssets(this.supabase, "avatars", [oldData.cover_path]),
      );
    }

    // 4. Banner Image
    if (
      updateData.bannerPath !== undefined &&
      oldData.banner_path &&
      updateData.bannerPath !== oldData.banner_path
    ) {
      cleanupPromises.push(
        removeAssets(this.supabase, "avatars", [oldData.banner_path]),
      );
    }

    if (cleanupPromises.length > 0) {
      // Run cleanup in background, don't block the response. Log but don't throw on storage errors.
      Promise.all(cleanupPromises).catch((err) => {
        console.error("Storage cleanup failed:", err);
      });
    }

    // ── Update Associated Tables ──────────────────────────────────────────────
    if (storagePath) {
      const { data: existingScriptFile, error: existingScriptFileError } =
        await this.supabase
          .from("script_files")
          .select("id")
          .eq("script_id", id)
          .maybeSingle();

      if (existingScriptFileError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `File lookup failed: ${existingScriptFileError.message}`,
        });
      }

      const filePayload = {
        storage_path: storagePath,
        file_size: fileSize ?? null,
        page_count: pageCount ?? null,
      };

      if (existingScriptFile) {
        const { error: fileError } = await this.supabase
          .from("script_files")
          .update(filePayload)
          .eq("script_id", id);

        if (fileError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `File update failed: ${fileError.message}`,
          });
        }
      } else {
        const { error: fileError } = await this.supabase
          .from("script_files")
          .insert({
            script_id: id,
            ...filePayload,
          });

        if (fileError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `File insert failed: ${fileError.message}`,
          });
        }
      }
    }

    // Audio files (replace-set): when `audios` is provided, the desired list
    // fully replaces the current rows. Omitting `audios` leaves them untouched.
    if (audios !== undefined) {
      const { error: deleteError } = await this.supabase
        .from("audio_files")
        .delete()
        .eq("script_id", id);

      if (deleteError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Audio reset failed: ${deleteError.message}`,
        });
      }

      if (audios.length > 0) {
        const { error: audioError } = await this.supabase
          .from("audio_files")
          .insert(
            audios.map((audio, index) => ({
              script_id: id,
              storage_path: audio.storagePath,
              title: audio.title,
              description: audio.description ?? null,
              sort_order: index,
              duration_seconds: audio.durationSeconds ?? null,
            })),
          );

        if (audioError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Audio insert failed: ${audioError.message}`,
          });
        }
      }
    }

    // Characters (replace-set): omitting `characters` leaves them untouched.
    if (characters !== undefined) {
      await replaceScriptCharacters(this.supabase, id, characters);
    }

    return { id };
  }

  async delete(id: string, authorId: string) {
    // Check ownership
    const { data: script } = await this.supabase
      .from("scripts")
      .select("author_id")
      .eq("id", id)
      .single();

    if (!script || script.author_id !== authorId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not the script author",
      });
    }

    // Get associated files to delete them from storage buckets
    const { data: filesToDelete } = await this.supabase
      .from("scripts")
      .select(
        "cover_path, banner_path, script_files(storage_path), audio_files(storage_path)",
      )
      .eq("id", id)
      .single();

    if (filesToDelete) {
      const pdfPaths =
        filesToDelete.script_files
          ?.map((f) => f.storage_path)
          .filter(Boolean) || [];
      if (pdfPaths.length > 0) {
        await this.supabase.storage
          .from("scripts")
          .remove(pdfPaths)
          .catch(() => {});
      }

      const audioPaths =
        filesToDelete.audio_files?.map((f) => f.storage_path).filter(Boolean) ||
        [];
      if (audioPaths.length > 0) {
        await this.supabase.storage
          .from("audio")
          .remove(audioPaths)
          .catch(() => {});
      }

      if (filesToDelete.cover_path) {
        await this.supabase.storage
          .from("avatars")
          .remove([filesToDelete.cover_path])
          .catch(() => {});
      }

      if (filesToDelete.banner_path) {
        await this.supabase.storage
          .from("avatars")
          .remove([filesToDelete.banner_path])
          .catch(() => {});
      }
    }

    // Now delete the database record (cascade will handle child tables)
    const { error } = await this.supabase.from("scripts").delete().eq("id", id);

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return { success: true };
  }

  async getById(id: string) {
    const { data: script } = await this.supabase
      .from("scripts")
      .select(
        "id, title, logline, synopsis, genre, subgenres, age_rating, bn_registration, is_featured, status, published_at, banner_path, cover_path, pitch_deck_path," +
          " script_files(id, storage_path, page_count, file_size)," +
          " audio_files(id, storage_path, title, description, sort_order, duration_seconds)," +
          " script_characters(id, name, description, apparent_age, gender, traits, sort_order)," +
          " author:users!author_id(id, name, image, bio)",
      )
      .eq("id", id)
      .maybeSingle();

    if (!script) return null;
    const scriptData = script as unknown as Record<string, unknown> & {
      author?: unknown;
      cover_path?: unknown;
      banner_path?: unknown;
    };

    const coverPath =
      typeof scriptData.cover_path === "string" &&
      scriptData.cover_path.length > 0
        ? scriptData.cover_path
        : null;
    const bannerPath =
      typeof scriptData.banner_path === "string" &&
      scriptData.banner_path.length > 0
        ? scriptData.banner_path
        : null;

    const coverUrl = getAssetUrl(coverPath, "avatars");
    const bannerUrl = getAssetUrl(bannerPath, "avatars");

    // Order attached audios deterministically by sort_order.
    const audioFiles = Array.isArray(scriptData.audio_files)
      ? [...(scriptData.audio_files as Array<{ sort_order?: number }>)].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        )
      : scriptData.audio_files;

    const characters = Array.isArray(scriptData.script_characters)
      ? [...(scriptData.script_characters as Array<{ sort_order?: number }>)].sort(
          (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
        )
      : [];

    return {
      ...scriptData,
      audio_files: audioFiles,
      script_characters: characters,
      author: Array.isArray(scriptData.author)
        ? scriptData.author[0]
        : (scriptData.author ?? null),
      cover_url: coverUrl,
      banner_url: bannerUrl,
    } as ScriptDetail;
  }

  async listRecent(limit: number, cursor?: string) {
    let query = this.supabase
      .from("scripts")
      .select(
        "id, title, genre, banner_path, cover_path, published_at, script_files(page_count), author:users!author_id(id, name)",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit + 1);

    // Compare against the raw DB value: `new Date()` would read a tz-less
    // timestamp as server-local time and drop microseconds.
    if (cursor) {
      query = query.lt("published_at", cursor);
    }

    const { data: rows, error } = await query;

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });

    const items = (rows ?? []).map((row) => {
      const r = row as Record<string, unknown> & {
        author?: unknown;
        published_at?: string;
      };
      return {
        id: r.id,
        title: r.title,
        genre: r.genre,
        banner_path: r.banner_path,
        cover_path: r.cover_path,
        script_files: r.script_files,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
        published_at: r.published_at,
      };
    }) as (ScriptListItem & { published_at?: string })[];

    const hasMore = items.length > limit;
    const returnedItems = items.slice(0, limit);

    // Get the last item's published_at as nextCursor
    const nextCursor =
      hasMore && returnedItems.length > 0
        ? (returnedItems[returnedItems.length - 1]?.published_at ?? null)
        : null;

    return {
      items: returnedItems,
      hasMore,
      nextCursor,
    };
  }
  async listFeatured(): Promise<ScriptListItem[]> {
    const { data, error } = await this.supabase
      .from("scripts")
      .select(
        "id, title, genre, banner_path, cover_path, script_files(page_count), author:users!author_id(id, name)",
      )
      .eq("status", "published")
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(6);

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown };
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      };
    }) as ScriptListItem[];
  }
  async listTrendingBanners(): Promise<ScriptListItem[]> {
    const { data, error } = await this.supabase
      .from("scripts")
      .select(
        "id, title, genre, banner_path, cover_path, script_files(page_count), author:users!author_id(id, name), logline",
      )
      .eq("status", "published")
      .not("banner_path", "is", null)
      .order("published_at", { ascending: false })
      .limit(3);

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown };
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      };
    }) as ScriptListItem[];
  }

  async listByAuthor(authorId: string): Promise<ScriptListItem[]> {
    const { data, error } = await this.supabase
      .from("scripts")
      .select(
        "id, title, genre, banner_path, cover_path, script_files(page_count), author:users!author_id(id, name)",
      )
      .eq("author_id", authorId)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });

    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown };
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      };
    }) as ScriptListItem[];
  }

  async getDashboardMetrics(authorId: string): Promise<DashboardMetrics> {
    const { data, error } = await this.supabase.rpc(
      "get_author_dashboard_metrics",
      {
        p_author_id: authorId,
      },
    );

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    return data as DashboardMetrics;
  }

  async search(
    query?: string,
    genres?: string[],
    ageRatings?: string[],
  ): Promise<ScriptListItem[]> {
    let queryBuilder = this.supabase
      .from("scripts")
      .select(
        "id, title, genre, banner_path, cover_path, script_files(page_count), author:users!author_id(id, name)",
      )
      .eq("status", "published");

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,logline.ilike.%${query}%`,
      );
    }

    if (genres && genres.length > 0) {
      queryBuilder = queryBuilder.in("genre", genres);
    }

    if (ageRatings && ageRatings.length > 0) {
      queryBuilder = queryBuilder.in("age_rating", ageRatings);
    }

    const { data } = await queryBuilder.limit(20);
    return (data ?? []).map((row) => {
      const r = row as Record<string, unknown> & { author?: unknown };
      return {
        ...r,
        author: Array.isArray(r.author) ? r.author[0] : (r.author ?? null),
      };
    }) as ScriptListItem[];
  }
}

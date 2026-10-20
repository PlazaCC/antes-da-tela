import {
  AGE_RATINGS,
  AUDIO_CATEGORIES,
  GENRES,
  MAX_CHARACTER_TRAIT_LENGTH,
  MAX_CHARACTER_TRAITS,
  MAX_CHARACTERS,
  MAX_SUBGENRES,
} from "@/lib/constants/scripts";
import { z } from "zod";

/** A single attached audio file with its preset category and optional description. */
export const audioInputSchema = z.object({
  storagePath: z.string().min(1),
  title: z.enum(AUDIO_CATEGORIES),
  description: z.string().max(300).optional(),
  durationSeconds: z.number().int().positive().optional(),
});

export type AudioInput = z.infer<typeof audioInputSchema>;

export const MAX_AUDIOS = 8;

/** A character of the script's cast (optional publish step). */
export const characterInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().max(1000).optional(),
  apparentAge: z.string().max(30).optional(),
  gender: z.string().max(40).optional(),
  traits: z
    .array(z.string().trim().min(1).max(MAX_CHARACTER_TRAIT_LENGTH))
    .max(MAX_CHARACTER_TRAITS)
    .optional(),
});

export type CharacterInput = z.infer<typeof characterInputSchema>;

export const scriptCreateSchema = z.object({
  title: z.string().min(1).max(200),
  logline: z.string().max(300).optional(),
  synopsis: z.string().max(2000).optional(),
  genre: z.enum(GENRES).optional(),
  subgenres: z.array(z.enum(GENRES)).max(MAX_SUBGENRES).optional(),
  ageRating: z.enum(AGE_RATINGS).optional(),
  bnRegistration: z.string().max(100).optional(),
  status: z.enum(["draft", "published"]).optional(),
  storagePath: z.string().min(1),
  fileSize: z.number().int().positive().optional(),
  pageCount: z.number().int().positive().optional(),
  bannerPath: z.string().nullable().optional(),
  coverPath: z.string().nullable().optional(),
  pitchDeckPath: z.string().nullable().optional(),
  audios: z.array(audioInputSchema).max(MAX_AUDIOS).optional(),
  characters: z.array(characterInputSchema).max(MAX_CHARACTERS).optional(),
  // authorId is read from the session — never accepted from client input
});

export const scriptUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  logline: z.string().max(300).optional(),
  synopsis: z.string().max(2000).optional(),
  genre: z.enum(GENRES).optional(),
  subgenres: z.array(z.enum(GENRES)).max(MAX_SUBGENRES).optional(),
  ageRating: z.enum(AGE_RATINGS).optional(),
  bnRegistration: z.string().max(100).optional(),
  status: z.enum(["draft", "published"]).optional(),
  bannerPath: z.string().nullable().optional(),
  coverPath: z.string().nullable().optional(),
  pitchDeckPath: z.string().nullable().optional(),
  // For now, updating the file itself is not in the schema,
  // but could be added if needed. The task says "reenviar PDF".
  storagePath: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  pageCount: z.number().int().positive().optional(),
  // Full desired set of audios (replace-set semantics on update).
  audios: z.array(audioInputSchema).max(MAX_AUDIOS).optional(),
  // Full desired cast (replace-set semantics on update).
  characters: z.array(characterInputSchema).max(MAX_CHARACTERS).optional(),
});

export type ScriptCreateInput = z.infer<typeof scriptCreateSchema>;
export type ScriptUpdateInput = z.infer<typeof scriptUpdateSchema>;

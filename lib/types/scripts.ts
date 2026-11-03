export type ScriptStatus = "draft" | "published" | "archived";

export interface ScriptListItem {
  id: string;
  title: string;
  genre: string | null;
  cover_path: string | null;
  banner_path: string | null;
  script_files: { page_count: number | null }[];
  author: { id: string; name: string | null } | null;
  logline: string | null;
}

export interface ScriptFile {
  id: string;
  /** Absent for signed-out visitors (reading requires an account). */
  storage_path?: string;
  page_count: number | null;
  file_size: number | null;
}

export interface AudioFile {
  id: string;
  /** Absent for signed-out visitors (reading requires an account). */
  storage_path?: string;
  title: string;
  description: string | null;
  sort_order: number;
  duration_seconds: number | null;
}

export interface ScriptCharacter {
  id: string;
  name: string;
  description: string | null;
  apparent_age: string | null;
  gender: string | null;
  traits: string[];
  sort_order: number;
}

export interface ScriptDetail {
  id: string;
  title: string;
  logline: string | null;
  synopsis: string | null;
  genre: string | null;
  subgenres: string[] | null;
  age_rating: string | null;
  bn_registration: string | null;
  is_featured: boolean;
  status: ScriptStatus;
  published_at: string | null;
  banner_path: string | null;
  cover_path: string | null;
  /** Absent for signed-out visitors (reading requires an account). */
  pitch_deck_path?: string | null;
  banner_url?: string | null;
  cover_url?: string | null;
  script_files: ScriptFile[];
  audio_files: AudioFile[];
  script_characters: ScriptCharacter[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  } | null;
}

export interface DashboardScriptMetrics {
  id: string;
  title: string;
  status: string;
  /** null when the script has no ratings yet. */
  avgRating: number | null;
  ratingCount: number;
  /** Comments by other people; the author's own comments are not counted. */
  commentCount: number;
  /** Signed-in readers (the author excluded) and how many reached the last page. */
  readers: number;
  completedReads: number;
}

export interface DashboardMetrics {
  scripts: DashboardScriptMetrics[];
  avgRating: number | null;
  ratingCount: number;
  totalComments: number;
  /** Includes drafts. */
  totalScripts: number;
  publishedScripts: number;
  /** Distinct readers across all scripts; new ones by first read in each 30-day window. */
  readers: { unique: number; newLast30: number; newPrev30: number };
}

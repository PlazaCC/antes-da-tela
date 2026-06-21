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
  storage_path: string;
  page_count: number | null;
  file_size: number | null;
}

export interface AudioFile {
  id: string;
  storage_path: string;
  title: string;
  description: string | null;
  sort_order: number;
  duration_seconds: number | null;
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
  pitch_deck_path: string | null;
  banner_url?: string | null;
  cover_url?: string | null;
  script_files: ScriptFile[];
  audio_files: AudioFile[];
  author: {
    id: string;
    name: string | null;
    image: string | null;
    bio: string | null;
  } | null;
}

export interface DashboardMetrics {
  scripts: Array<{
    id: string;
    title: string;
    status: string;
    avgRating: number;
    commentCount: number;
  }>;
  avgRating: number | null;
  totalScripts: number;
}

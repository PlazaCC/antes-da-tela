export type ScriptStatus = 'draft' | 'published' | 'archived'

export interface ScriptListItem {
  id: string
  title: string
  genre: string | null
  script_files: { page_count: number | null }[]
  author: { id: string; name: string | null } | null
}

export interface ScriptFile {
  id: string
  storage_path: string
  page_count: number | null
  file_size: number | null
}

export interface AudioFile {
  id: string
  storage_path: string
  duration_seconds: number | null
}

export interface ScriptDetail {
  id: string
  title: string
  logline: string | null
  synopsis: string | null
  genre: string | null
  age_rating: string | null
  is_featured: boolean
  published_at: string | null
  banner_path: string | null
  script_files: ScriptFile[]
  audio_files: AudioFile[]
  author: { id: string; name: string | null; image: string | null; bio: string | null } | null
}

export interface DashboardMetrics {
  scripts: Array<{
    id: string
    title: string
    status: string
    avgRating: number
    commentCount: number
  }>
  avgRating: number | null
  totalScripts: number
}

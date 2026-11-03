/** Reading stats of one script, as returned by get_script_read_stats (author only). */
export interface ScriptReadStats {
  readers: number
  /** Readers who reached the last page. */
  completed: number
  /** Readers who started in the last 30 days / in the 30 days before. */
  newLast30: number
  newPrev30: number
  /** Readers who reached 25, 50, 75 and 100% of the pages. */
  milestones: Array<{ milestone: number; count: number }>
  /** Last page reached by readers who did not finish, in page order. */
  stopPages: Array<{ page: number; count: number }>
}

/** Reader counts across all scripts of the author, as returned by get_author_read_counts. */
export interface AuthorReadCounts {
  uniqueReaders: number
  newLast30: number
  newPrev30: number
  scripts: Array<{ scriptId: string; readers: number; completed: number }>
}

export const EMPTY_SCRIPT_READ_STATS: ScriptReadStats = {
  readers: 0,
  completed: 0,
  newLast30: 0,
  newPrev30: 0,
  milestones: [25, 50, 75, 100].map((milestone) => ({ milestone, count: 0 })),
  stopPages: [],
}

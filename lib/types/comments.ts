export interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
}

export interface CommentWithAuthor {
  id: string
  script_id: string
  page_number: number
  content: string
  created_at: string
  author: CommentAuthor | null
}

export interface ReactionSummary {
  emoji: string
  count: number
  userReacted: boolean
}

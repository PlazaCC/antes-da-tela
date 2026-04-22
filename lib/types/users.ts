export interface UserProfile {
  id: string
  name: string
  email: string | null
  image: string | null
  bio: string | null
  createdAt: string
}

export interface ProfileStats {
  followers: number
  following: number
  scripts: number
  avgRating: number | null
}

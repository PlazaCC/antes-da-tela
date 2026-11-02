export interface UserProfile {
  id: string
  name: string
  email: string | null
  image: string | null
  bio: string | null
  displayName: string | null
  pronouns: string | null
  location: string | null
  links: ProfileLinks | null
  createdAt: string
}

export interface ProfileLinks {
  instagram?: string
  website?: string
  portfolio?: string
}

export interface ProfileStats {
  followers: number
  following: number
  scripts: number
  avgRating: number | null
}

export interface FollowUser {
  id: string
  name: string
  image: string | null
  bio: string | null
}

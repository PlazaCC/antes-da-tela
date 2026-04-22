interface UserMetadata {
  full_name?: string
  name?: string
  [key: string]: unknown
}

interface AuthClaimsLike {
  user_metadata?: UserMetadata
  email?: string
}

export function getUserDisplayName(claims: AuthClaimsLike): string | null {
  return (
    (claims.user_metadata?.full_name as string | undefined) ??
    (claims.user_metadata?.name as string | undefined) ??
    claims.email?.split('@')[0] ??
    null
  )
}

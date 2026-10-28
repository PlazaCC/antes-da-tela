import { z } from 'zod'

const optionalText = (max: number) => z.string().trim().max(max).optional()

// Accepts a handle (`@maria`) or a URL; stored as typed.
const optionalLink = z.string().trim().max(200).optional()

export const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo de 2 caracteres').max(100),
  bio: z.string().max(500).optional(),
  displayName: optionalText(60),
  pronouns: optionalText(30),
  location: optionalText(80),
  instagram: optionalLink,
  website: optionalLink,
  portfolio: optionalLink,
})

export type ProfileFormValues = z.infer<typeof profileSchema>

/** Server input for users.updateProfile — every field optional, empty → null. */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).nullable().optional(),
  image: z.string().url().optional(),
  displayName: z.string().trim().max(60).nullable().optional(),
  pronouns: z.string().trim().max(30).nullable().optional(),
  location: z.string().trim().max(80).nullable().optional(),
  links: z
    .object({
      instagram: z.string().trim().max(200).optional(),
      website: z.string().trim().max(200).optional(),
      portfolio: z.string().trim().max(200).optional(),
    })
    .nullable()
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

/** Form values → updateProfile input: blank strings become null / are dropped. */
export function toProfileInput(values: ProfileFormValues): UpdateProfileInput {
  const blankToNull = (value?: string) => (value && value.trim() ? value.trim() : null)
  const links = Object.fromEntries(
    (['instagram', 'website', 'portfolio'] as const)
      .map((key) => [key, values[key]?.trim()])
      .filter(([, value]) => !!value),
  )
  return {
    name: values.name,
    bio: blankToNull(values.bio),
    displayName: blankToNull(values.displayName),
    pronouns: blankToNull(values.pronouns),
    location: blankToNull(values.location),
    links: Object.keys(links).length ? links : null,
  }
}

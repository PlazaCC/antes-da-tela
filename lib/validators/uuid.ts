/**
 * UUID regex pattern for validating UUID format (RFC 4122)
 * Matches standard UUID format: xxxxxxxx-xxxx-vxxx-yxxx-xxxxxxxxxxxx
 * where v is 1-8 (UUID version) and y is 8, 9, a, or b
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * Validates if a string is a valid UUID
 * @param id - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export function validateUUID(id: string): boolean {
  return UUID_REGEX.test(id)
}

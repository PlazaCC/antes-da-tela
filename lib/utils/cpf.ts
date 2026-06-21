/**
 * CPF helpers.
 *
 * Storage rule (see CLAUDE.md / plan): CPF is persisted as 11 digits only,
 * without dots or dashes. The UI shows it masked as `000.000.000-00`.
 */

/** Strips everything that is not a digit. */
export function stripCpf(value: string): string {
  return value.replace(/\D/g, '')
}

/** Formats a CPF (digits or partial) as `000.000.000-00` for display. */
export function formatCpf(value: string): string {
  const digits = stripCpf(value).slice(0, 11)
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9, 11)].filter(Boolean)

  if (parts.length <= 1) return parts[0] ?? ''
  let out = parts[0]
  if (parts[1]) out += `.${parts[1]}`
  if (parts[2]) out += `.${parts[2]}`
  if (parts[3]) out += `-${parts[3]}`
  return out
}

/** Validates a CPF using the official check-digit algorithm. Accepts masked or raw input. */
export function isValidCpf(value: string): boolean {
  const cpf = stripCpf(value)
  if (cpf.length !== 11) return false
  // Reject sequences of a single repeated digit (e.g. 00000000000).
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calcDigit = (length: number): number => {
    let sum = 0
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (length + 1 - i)
    }
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10])
}

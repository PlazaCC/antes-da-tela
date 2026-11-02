import 'server-only'

import { sendEmail } from '@/lib/email/send'
import { getSiteUrl } from '@/lib/site-url'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Tells the interpreter how the review went. Reads the e-mail with the service
 * role (users.email is not part of the app's data access) — privileged,
 * notification-only use.
 */
export async function notifyInterpreterReview(input: {
  userId: string
  status: 'approved' | 'rejected'
  reason?: string
}): Promise<void> {
  const { data: user } = await createAdminClient().from('users').select('email, name').eq('id', input.userId).maybeSingle()
  if (!user?.email) return

  const link = new URL('/profile/interpreter', getSiteUrl()).toString()
  const approved = input.status === 'approved'
  await sendEmail({
    to: user.email,
    subject: approved ? 'Seu cadastro de intérprete foi aprovado!' : 'Sobre seu cadastro de intérprete',
    html: approved
      ? `<p>Olá, ${escapeHtml(user.name)}!</p><p>Seu cadastro de intérprete no Antes da Tela foi aprovado. Agora você pode participar dos castings dos editais.</p><p><a href="${link}">Ver minha área de intérprete</a></p>`
      : `<p>Olá, ${escapeHtml(user.name)}.</p><p>Seu cadastro de intérprete não foi aprovado desta vez.</p><p>Motivo: ${escapeHtml(input.reason ?? '')}</p><p>Você pode enviar um novo material quando quiser: <a href="${link}">área de intérprete</a>.</p>`,
  })
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

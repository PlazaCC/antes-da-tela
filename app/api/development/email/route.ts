import { sendEmail } from '@/lib/email/send'
import { canUseIntegrationChecks } from '@/lib/dev-tools-guard'
import { NextResponse } from 'next/server'

// Resend's test inbox: simulates a delivered message without real mail traffic.
const TEST_RECIPIENT = 'delivered@resend.dev'

/**
 * Sends a test e-mail through the app's real sender (RESEND_API_KEY +
 * RESEND_FROM_EMAIL) to Resend's test inbox and returns the Resend id.
 */
export async function POST(request: Request) {
  if (!(await canUseIntegrationChecks())) return new NextResponse('Not Found', { status: 404 })

  const { marker } = (await request.json().catch(() => ({}))) as { marker?: string }
  const id = await sendEmail({
    to: TEST_RECIPIENT,
    subject: `[Antes da Tela] Verificação de e-mail ${marker ?? ''}`.trim(),
    html: '<p>Mensagem de verificação da integração com o Resend.</p>',
  })
  if (!id) {
    return NextResponse.json({ error: 'Envio recusado ou Resend não configurado (veja os logs do servidor)' }, { status: 502 })
  }
  return NextResponse.json({ id })
}

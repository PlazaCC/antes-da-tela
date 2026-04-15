import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { to } = await req.json()
  // Só permite envio para o próprio e-mail de teste
  if (to !== 'seu-email@exemplo.com') {
    return NextResponse.json({ error: 'Só é permitido enviar para o seu próprio e-mail de teste.' }, { status: 400 })
  }
  try {
    const data = await resend.emails.send({
      from: 'noreply@resend.dev',
      to,
      subject: 'Teste Resend Plaza',
      html: `<h2>Teste de envio via Resend</h2><p>Se você recebeu este e-mail, o Resend está funcionando! 🎉</p>`,
    })
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Erro desconhecido' }, { status: 500 })
  }
}

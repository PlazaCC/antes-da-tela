import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const API_KEY = process.env.RESEND_API_KEY
  const TEST_TO = process.env.TEST_RESEND_TO

  if (!API_KEY) {
    return NextResponse.json({ error: 'RESEND_API_KEY não está configurada' }, { status: 500 })
  }
  if (!TEST_TO) {
    return NextResponse.json({ error: 'TEST_RESEND_TO não está configurado' }, { status: 500 })
  }

  const resend = new Resend(API_KEY)

  const { to } = await req.json()
  // Só permite envio para o e-mail de teste configurado
  if (to !== TEST_TO) {
    return NextResponse.json({ error: 'Só é permitido enviar para o e-mail de teste configurado.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'noreply@resend.dev',
      to,
      subject: 'Teste Resend Plaza',
      html: `<h2>Teste de envio via Resend</h2><p>Se você recebeu este e-mail, o Resend está funcionando! 🎉</p>`,
    })
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message || 'Erro desconhecido' }, { status: 500 })
  }
}

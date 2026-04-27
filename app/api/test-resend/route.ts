import withErrorHandler from '@/lib/api/withErrorHandler'
import { AppError } from '@/lib/errors'
import { Resend } from 'resend'

async function handler(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 })
  }

  const API_KEY = process.env.RESEND_API_KEY
  const TEST_TO = process.env.TEST_RESEND_TO

  if (!API_KEY) {
    throw new AppError('RESEND_API_KEY não está configurada', { code: 'MISSING_CONFIG', statusCode: 500 })
  }
  if (!TEST_TO) {
    throw new AppError('TEST_RESEND_TO não está configurado', { code: 'MISSING_CONFIG', statusCode: 500 })
  }

  const resend = new Resend(API_KEY)

  const { to } = await (req as Request).json()
  // Só permite envio para o e-mail de teste configurado
  if (to !== TEST_TO) {
    throw new AppError('Só é permitido enviar para o e-mail de teste configurado.', {
      code: 'INVALID_ARG',
      statusCode: 400,
    })
  }

  await resend.emails.send({
    from: 'noreply@resend.dev',
    to,
    subject: 'Teste Resend Plaza',
    html: `<h2>Teste de envio via Resend</h2><p>Se você recebeu este e-mail, o Resend está funcionando! 🎉</p>`,
  })

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

export const POST = withErrorHandler(handler)

import { expect, test, type Page } from '@playwright/test'
import { pageAs } from './support/fixtures'
import { silentWav } from './support/media'
import { SEEDED_SCRIPT_TITLE } from './support/users'

/**
 * The whole call cycle (RFC-006 phases 2–5), one role per page:
 * interpreter registration → curation → call → entry → casting → shortlist →
 * cast choice → vote → winner. Steps depend on each other, so the file runs
 * serially and stops at the first failure.
 */
test.describe.configure({ mode: 'serial' })

const slug = `e2e-${Date.now()}`
let adminCallUrl = ''
let entryUrl = ''

async function advancePhase(page: Page, to: string) {
  await page.goto(adminCallUrl)
  await page.getByRole('button', { name: /Avançar para/ }).click()
  await expect(page.getByText(to, { exact: true }).first()).toBeVisible()
}

test('intérprete se cadastra (narração, áudio de apresentação)', async ({ browser }) => {
  const page = await pageAs(browser, 'interpreter')
  await page.goto('/profile/interpreter')
  await page.getByRole('button', { name: 'Narrar', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles({ name: 'apresentacao.wav', mimeType: 'audio/wav', buffer: silentWav() })
  await expect(page.locator('audio')).toBeVisible()
  await page.getByLabel('Data de nascimento').fill('1990-01-01')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Enviar para curadoria' }).click()
  await expect(page.getByText('Em curadoria')).toBeVisible()
})

test('admin reprova com motivo; intérprete vê o motivo e reenvia', async ({ browser }) => {
  const admin = await pageAs(browser, 'admin')
  await admin.goto('/admin/interpretes')
  const card = admin.locator('article').filter({ hasText: 'E2E Intérprete' })
  await card.getByPlaceholder(/Motivo da reprovação/).fill('Áudio muito baixo — e2e')
  await card.getByRole('button', { name: 'Reprovar' }).click()
  await expect(admin.getByText('Cadastro reprovado.')).toBeVisible()

  const interpreter = await pageAs(browser, 'interpreter')
  await interpreter.goto('/profile/interpreter')
  await expect(interpreter.getByText('Não aprovado')).toBeVisible()
  await expect(interpreter.getByText('Motivo: Áudio muito baixo — e2e')).toBeVisible()
  await interpreter.getByRole('checkbox').check() // consent is asked again on every submission
  await interpreter.getByRole('button', { name: 'Enviar para curadoria' }).click()
  await expect(interpreter.getByText('Em curadoria')).toBeVisible()
})

test('admin aprova o intérprete', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await page.goto('/admin/interpretes')
  const card = page.locator('article').filter({ hasText: 'E2E Intérprete' })
  await card.getByRole('button', { name: 'Aprovar' }).click()
  await expect(page.getByText('Intérprete aprovado.')).toBeVisible()
})

test('admin cria o edital e abre as inscrições', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await page.goto('/admin/editais/novo')
  await page.getByLabel('Título').fill(`Edital E2E ${slug}`)
  await page.getByLabel('Endereço (slug)').fill(slug)
  await page.getByRole('button', { name: 'Salvar edital' }).click()
  await page.waitForURL(/\/admin\/editais\/[0-9a-f-]{36}$/)
  adminCallUrl = new URL(page.url()).pathname
  await advancePhase(page, 'Inscrições abertas')
})

test('roteirista inscreve o roteiro com um personagem', async ({ browser }) => {
  const page = await pageAs(browser, 'admin') // the admin account is also the seeded script's author
  await page.goto(`/editais/${slug}/inscricao`)
  await page.getByRole('button', { name: new RegExp(SEEDED_SCRIPT_TITLE) }).click()
  await page.getByRole('button', { name: /Adicionar personagem/ }).click()
  await page.getByPlaceholder('Ex.: Helena Duarte').fill('Ana')
  await page.getByRole('button', { name: 'Narrar', exact: true }).click()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Enviar inscrição' }).click()
  await expect(page.getByText('Em análise')).toBeVisible()
})

test('admin aprova a inscrição e abre o casting', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await page.goto(adminCallUrl)
  await page.getByRole('button', { name: 'Aprovar' }).click()
  await expect(page.getByText('Aprovada', { exact: true })).toBeVisible()
  await advancePhase(page, 'Casting')
})

test('intérprete envia o casting usando a apresentação do cadastro', async ({ browser }) => {
  const page = await pageAs(browser, 'interpreter')
  await page.goto(`/editais/${slug}/casting`)
  await expect(page.getByRole('heading', { name: 'Ana' })).toBeVisible()
  await page.getByRole('button', { name: 'Enviar casting' }).click()
  await page.getByRole('button', { name: 'Enviar casting' }).click() // the form's submit (default: registration media)
  await expect(page.getByText('Seu casting · Enviado')).toBeVisible()
})

test('admin marca o finalista e passa para a curadoria', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await page.goto(`${adminCallUrl}/casting`)
  await page.getByRole('button', { name: 'Marcar finalista' }).click()
  await expect(page.getByText('finalistas 1/3')).toBeVisible()
  await advancePhase(page, 'Curadoria e elenco')
})

test('roteirista escolhe o elenco', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await page.goto(`/editais/${slug}/inscricao`)
  await page.getByRole('button', { name: 'Escolher' }).click()
  await expect(page.getByText('Escolhido(a)')).toBeVisible()
})

test('admin abre a votação', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await advancePhase(page, 'Votação')
  await page.goto(`/editais/${slug}`)
  entryUrl = (await page.getByRole('link', { name: /Ver elenco e votar/ }).getAttribute('href'))!
  expect(entryUrl).toMatch(new RegExp(`/editais/${slug}/r/`))
})

test('visitante sem login no link compartilhado é convidado a se cadastrar', async ({ browser }) => {
  const page = await browser.newPage()
  await page.goto(entryUrl)
  await expect(page.getByRole('link', { name: 'Cadastrar e votar' })).toHaveAttribute('href', /\/auth\/sign-up\?next=/)
  await page.close()
})

test('link compartilhado: prévia e voto com documento', async ({ browser }) => {
  const page = await pageAs(browser, 'voter')
  await page.goto(entryUrl)
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', new RegExp(SEEDED_SCRIPT_TITLE))
  await expect(page.getByText('E2E Intérprete')).toBeVisible() // chosen cast is public while voting

  await page.locator('#document-number').fill('52998224725')
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()
  await page.getByRole('button', { name: 'Votar neste roteiro' }).click()
  await expect(page.getByText('Seu voto foi registrado neste roteiro. Obrigado!')).toBeVisible()

  await page.reload()
  await expect(page.getByText('Seu voto foi registrado neste roteiro. Obrigado!')).toBeVisible()
})

test('admin declara o vencedor e encerra; página mostra resultado', async ({ browser }) => {
  const page = await pageAs(browser, 'admin')
  await page.goto(adminCallUrl)
  await page.getByLabel(new RegExp(SEEDED_SCRIPT_TITLE)).check()
  await page.getByRole('button', { name: 'Salvar resultado' }).click()
  await expect(page.getByText('Resultado salvo.')).toBeVisible()
  await advancePhase(page, 'Encerrado')

  await page.goto(`/editais/${slug}`)
  await expect(page.getByText('🏆 Roteiro vencedor')).toBeVisible()
  await expect(page.getByText('1 votos').first()).toBeVisible()
})

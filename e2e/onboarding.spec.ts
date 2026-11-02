import { expect, test, type Browser, type Page } from '@playwright/test'
import { adminDb, loadUserIds, resetNewcomer } from './support/db'
import { closePages, pageAs } from './support/fixtures'
import { silentWav } from './support/media'

/**
 * First login for each kind of onboarding (RFC-006 §1). The steps depend on
 * the intents: everyone goes intent → profile → preferences → done;
 * interpreters add their registration, producers the "publish" invite.
 * All tests use the newcomer account, reset to brand new before each one, so
 * they are independent (one worker runs them in order; see playwright.config).
 */

test.beforeEach(async () => {
  await closePages()
  await resetNewcomer(adminDb(), loadUserIds().newcomer)
})

const INTENTS = {
  reader: /Quero ler roteiros/,
  producer: /Quero publicar meus roteiros/,
  interpreter: /Quero interpretar/,
}

// The done step's shortcut (the footer has its own "Publicar roteiro" link).
const PUBLISH_SHORTCUT = /Receba leituras e feedback/

/** Opens the app as the newcomer (sent to the onboarding), picks the intents and leaves O1. */
async function startOnboarding(browser: Browser, intents: Array<keyof typeof INTENTS>, totalSteps: number): Promise<Page> {
  const page = await pageAs(browser, 'newcomer')
  await page.goto('/feed')
  await expect(page).toHaveURL(/\/onboarding/)
  await expectStep(page, 1, 3, 'Boas-vindas ao Antes da Tela!') // base steps until an intent adds more
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  for (const intent of intents) await page.getByRole('button', { name: INTENTS[intent] }).click()
  await expect(page.getByText(`Passo 1 de ${totalSteps}`)).toBeVisible()
  await page.getByRole('button', { name: 'Continuar' }).click()
  return page
}

async function expectStep(page: Page, current: number, total: number, heading: string) {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  await expect(page.getByText(`Passo ${current} de ${total}`)).toBeVisible()
}

async function skipProfileAndPreferences(page: Page, total: number, interpreterStep = false) {
  await expectStep(page, 2, total, 'Conte um pouco sobre você')
  await page.getByRole('button', { name: 'Pular esta etapa' }).click()
  if (interpreterStep) {
    await expectStep(page, 3, total, 'Cadastro de intérprete')
    await page.getByRole('button', { name: 'Fazer depois' }).click()
  }
  await expectStep(page, interpreterStep ? 4 : 3, total, 'O que você gosta de ver?')
  await page.getByRole('button', { name: 'Pular', exact: true }).click()
}

async function finish(page: Page) {
  await expect(page.getByRole('heading', { name: 'Tudo pronto!' })).toBeVisible()
  await page.getByRole('link', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(/\/feed/)
}

test('leitor: perfil e preferências salvos, volta ao feed', async ({ browser }) => {
  const page = await startOnboarding(browser, ['reader'], 3)

  await expectStep(page, 2, 3, 'Conte um pouco sobre você')
  await page.getByLabel('Como gostaria de ser chamado(a)?').fill('Novato E2E')
  await page.getByLabel('Pronomes').fill('ele/dele')
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()

  await expectStep(page, 3, 3, 'O que você gosta de ver?')
  await page.getByRole('button', { name: 'drama', exact: true }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  await expect(page.getByRole('link', { name: PUBLISH_SHORTCUT })).toHaveCount(0) // producer-only
  await finish(page)

  // Completed: no more redirect, and the profile kept the new fields
  await page.goto('/profile/edit')
  await expect(page.getByLabel('Como gostaria de ser chamado(a)?')).toHaveValue('Novato E2E')
  await expect(page.getByRole('button', { name: 'drama', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

test('roteirista: convite para publicar leva a /publish com o onboarding concluído', async ({ browser }) => {
  const page = await startOnboarding(browser, ['producer'], 4)
  await skipProfileAndPreferences(page, 4)

  await expectStep(page, 4, 4, 'Publique seu primeiro roteiro')
  await page.getByRole('button', { name: 'Publicar roteiro' }).click()
  await expect(page).toHaveURL(/\/publish/)

  await page.goto('/feed')
  await expect(page).toHaveURL(/\/feed/)
})

test('intérprete: cadastro enviado no onboarding fica em curadoria', async ({ browser }) => {
  const page = await startOnboarding(browser, ['interpreter'], 4)

  await expectStep(page, 2, 4, 'Conte um pouco sobre você')
  await page.getByRole('button', { name: 'Pular esta etapa' }).click()

  await expectStep(page, 3, 4, 'Cadastro de intérprete')
  await page.getByRole('button', { name: 'Narrar', exact: true }).click()
  await page.locator('input[type=file]').setInputFiles({ name: 'apresentacao.wav', mimeType: 'audio/wav', buffer: silentWav() })
  await expect(page.locator('audio')).toBeVisible()
  await page.getByLabel('Data de nascimento').fill('1995-05-20')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Enviar para curadoria' }).click()

  await expectStep(page, 4, 4, 'O que você gosta de ver?')
  await page.getByRole('button', { name: 'Pular', exact: true }).click()
  await finish(page)

  await page.goto('/profile/interpreter')
  await expect(page.getByText('Em curadoria')).toBeVisible()
})

test('intérprete: "Fazer depois" conclui sem cadastro', async ({ browser }) => {
  const page = await startOnboarding(browser, ['interpreter'], 4)
  await skipProfileAndPreferences(page, 4, true)
  await finish(page)

  await page.goto('/profile/interpreter')
  await expect(page.getByRole('button', { name: 'Enviar para curadoria' })).toBeVisible()
})

test('todas as intenções: cinco passos na ordem e atalho de publicação', async ({ browser }) => {
  const page = await startOnboarding(browser, ['reader', 'producer', 'interpreter'], 5)
  await skipProfileAndPreferences(page, 5, true)

  await expectStep(page, 5, 5, 'Publique seu primeiro roteiro')
  await page.getByRole('button', { name: 'Depois' }).click()

  await expect(page.getByRole('heading', { name: 'Tudo pronto!' })).toBeVisible()
  await expect(page.getByRole('link', { name: PUBLISH_SHORTCUT })).toBeVisible()
  await finish(page)
})

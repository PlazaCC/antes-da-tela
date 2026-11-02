import { expect, test } from '@playwright/test'
import { closePages, pageAs } from './support/fixtures'

test.beforeEach(closePages)

test('primeiro login: onboarding de leitor até o feed', async ({ browser }) => {
  const page = await pageAs(browser, 'newcomer')

  await page.goto('/feed')
  await expect(page).toHaveURL(/\/onboarding/)
  await expect(page.getByRole('heading', { name: 'Boas-vindas ao Antes da Tela!' })).toBeVisible()

  // O1 — intention (Continuar stays disabled until one is picked)
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled()
  await page.getByRole('button', { name: /Quero ler roteiros/ }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // O2 — profile
  await expect(page.getByRole('heading', { name: 'Conte um pouco sobre você' })).toBeVisible()
  await page.getByLabel('Como gostaria de ser chamado(a)?').fill('Novato E2E')
  await page.getByLabel('Pronomes').fill('ele/dele')
  await page.getByRole('button', { name: 'Salvar e continuar' }).click()

  // O3 — preferences
  await expect(page.getByRole('heading', { name: 'O que você gosta de ver?' })).toBeVisible()
  await page.getByRole('button', { name: 'drama', exact: true }).click()
  await page.getByRole('button', { name: 'Continuar' }).click()

  // O6 — done, back to where the user was going
  await expect(page.getByRole('heading', { name: 'Tudo pronto!' })).toBeVisible()
  await page.getByRole('link', { name: 'Continuar' }).click()
  await expect(page).toHaveURL(/\/feed/)

  // Completed: no more redirect, and the profile kept the new fields
  await page.goto('/profile/edit')
  await expect(page.getByLabel('Como gostaria de ser chamado(a)?')).toHaveValue('Novato E2E')
  await expect(page.getByRole('button', { name: 'drama', exact: true })).toHaveAttribute('aria-pressed', 'true')
})

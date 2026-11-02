import { expect, test } from '@playwright/test'

test.describe('visitante sem login', () => {
  test('lista de editais é pública', async ({ page }) => {
    await page.goto('/editais')
    await expect(page.getByRole('heading', { name: 'Editais', level: 1 })).toBeVisible()
  })

  test('área de intérprete e admin exigem login', async ({ page }) => {
    await page.goto('/profile/interpreter')
    await expect(page).toHaveURL(/\/auth\/login/)
    await page.goto('/admin/interpretes')
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  // With cacheComponents the shell streams before notFound(), so the status is
  // 200: Next marks the page noindex and renders app/not-found.tsx instead.
  test('edital inexistente mostra a página 404 (noindex)', async ({ page }) => {
    const response = await page.goto('/editais/edital-que-nao-existe')
    expect(await response?.text()).toContain('<meta name="robots" content="noindex"/>')
    await expect(page.getByRole('heading', { name: '404 — Página não encontrada' })).toBeVisible()
  })
})

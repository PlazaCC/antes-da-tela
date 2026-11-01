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

  test('edital inexistente devolve 404', async ({ page }) => {
    const response = await page.goto('/editais/edital-que-nao-existe')
    expect(response?.status()).toBe(404)
  })
})

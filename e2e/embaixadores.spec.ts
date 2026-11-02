import { expect, test } from '@playwright/test'

test.describe('página de embaixadores (pública)', () => {
  test('mostra elenco, depoimentos e apoiadores', async ({ page }) => {
    await page.goto('/embaixadores')
    await expect(page.getByRole('heading', { level: 1, name: /Quem lê roteiro/ })).toBeVisible()

    const elenco = page.getByRole('region', { name: 'Embaixadores' })
    await expect(elenco.getByRole('button', { name: /Ler bio completa/ })).toHaveCount(4)

    const depoimentos = page.getByRole('region', { name: 'Deu match.' })
    await expect(depoimentos.getByRole('figure')).toHaveCount(4)

    const creditos = page.getByRole('region', { name: 'Quem está com a gente' })
    await expect(creditos.getByRole('link', { name: /ABRA/ })).toHaveAttribute('href', 'https://www.abra.art.br/')
    await expect(creditos.getByRole('link', { name: /FRAPA/ })).toHaveAttribute('href', 'https://frapa.art.br/')
  })

  test('card abre a bio completa no painel lateral', async ({ page }) => {
    await page.goto('/embaixadores')
    await page.getByRole('button', { name: /Pedro de Barros/ }).click()

    const painel = page.getByRole('dialog', { name: 'Pedro de Barros' })
    await expect(painel).toBeVisible()
    await expect(painel.getByText('Projetos atuais')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(painel).toBeHidden()
  })
})

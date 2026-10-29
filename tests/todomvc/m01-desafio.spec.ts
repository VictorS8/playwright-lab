import { test, expect } from '@playwright/test';

test('abre a página do TodoMVC e checa os filtros', async ({ page }) => {
  await page.goto('/todomvc');

  await page.getByPlaceholder('What needs to be done?').fill('estudar Playwright');
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  // All: já está selecionado por padrão,
  // mas vou clicar para cumprir o enunciado do desafio
  await page.getByRole('link', { name: 'All' }).click();
  await expect(page).toHaveURL(/#\/$/);

  // Active
  await page.getByRole('link', { name: 'Active' }).click();
  await expect(page).toHaveURL(/#\/active$/);

  // Completed
  await page.getByRole('link', { name: 'Completed' }).click();
  await expect(page).toHaveURL(/#\/completed$/);

  await page.goBack();
  await expect(page).toHaveURL(/#\/active$/);

  await page.goBack();
  await expect(page).toHaveURL(/#\/$/);
});

import { test, expect } from '@playwright/test';

test('abre a página do TodoMVC', async ({ page }) => {
  // Arrange
  await page.goto('/todomvc');

  // Assert
  await expect(page).toHaveTitle(/TodoMVC/);
  await expect(page).toHaveURL(/\/todomvc/);
});

test('o filtro "Active" muda o endereço', async ({ page }) => {
  // Arrange
  await page.goto('/todomvc');

  await page.getByPlaceholder('What needs to be done?').fill('estudar Playwright');
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  // Act
  await page.getByRole('link', { name: 'Active' }).click();

  // Assert
  await expect(page).toHaveURL(/#\/active$/);
});

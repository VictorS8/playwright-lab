import { test, expect } from '@playwright/test';

test('abre o TodoMVC, toca no filtro "Completed" e verifica a url', async ({ page }) => {
  await page.goto('/todomvc');

  // Arrange
  await page.getByPlaceholder('What needs to be done?').fill('estudar Playwright');
  await page.getByPlaceholder('What needs to be done?').press('Enter');

  await page.getByTestId('todo-item')
    .filter({ hasText: 'estudar Playwright' })
    .getByRole('checkbox', { name: 'Toggle Todo' }).check();

  // Act
  await page.getByRole('link', { name: 'Completed' }).click();

  // Assert
  await expect(page).toHaveURL(/#\/completed$/);
});

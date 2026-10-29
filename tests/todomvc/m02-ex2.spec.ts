import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('mostra a dica "Double-click to edit a todo" depois de criar uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'estudar Playwright');

  await expect(page.getByText('Double-click to edit a todo')).toBeVisible();
});

import { test, expect } from '@playwright/test';

test('cria e conclui uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');
  const novaTarefa = page.getByPlaceholder('What needs to be done?');

  await novaTarefa.fill('Estudar locators');
  await novaTarefa.press('Enter');

  const tarefa = page.getByTestId('todo-item').filter({ hasText: 'Estudar locators' });
  await tarefa.getByRole('checkbox', { name: 'Toggle Todo' }).check();

  await expect(tarefa.getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
});

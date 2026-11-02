import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('cria uma tarefa e deleta', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'Estudar locators');

  const tarefa = page.getByTestId('todo-title');
  await tarefa.hover();

  const deletarTarefa = page.getByRole('button', { name: 'Delete' });
  await deletarTarefa.click();

  await expect(tarefa).toBeHidden();

});

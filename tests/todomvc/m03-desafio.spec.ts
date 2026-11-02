import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('ignora tarefa só com espaços', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, '   ');

  // const tarefa = page.getByTestId('todo-item');
  // await expect(tarefa).toHaveCount(0);
  await expect(page.getByTestId('todo-item')).toHaveCount(0);
});

test('ignora tarefa só com espaços e depois cria uma tarefa válida', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, '   ');
  await adicionarTarefa(page, 'Estudar locators');

  await expect(page.getByTestId('todo-item')).toHaveCount(1);
});

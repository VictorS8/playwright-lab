import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('cria 3 tarefas e verifica se aparece "3 items left"', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'Estudar locators');
  await adicionarTarefa(page, 'Estudar fixtures');
  await adicionarTarefa(page, 'Estudar page objects');

  const contadorDeTarefaFaltando = page.getByTestId('todo-count');
  await expect(contadorDeTarefaFaltando).toHaveText('3 items left');
});

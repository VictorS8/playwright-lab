import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('cria 3 tarefas e conclui todas', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'Estudar locators');
  await adicionarTarefa(page, 'Estudar fixtures');
  await adicionarTarefa(page, 'Estudar page objects');

  const marcarTodas = page.getByLabel('Mark all as complete');
  // Eu usei o click, pois não tem checkbox aparente,
  // mas o check() é a melhor pratica de uso, logo corrigi
  await marcarTodas.check();

  const contadorDeTarefasFaltando = page.getByTestId('todo-count');
  await expect(contadorDeTarefasFaltando).toHaveText('0 items left');
});

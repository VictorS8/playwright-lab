import { test, expect } from '@playwright/test';
import { concluirTarefa } from './helpers';

test('filtro Active mostra só as tarefas pendentes, na ordem de criação', async ({ page }) => {
  await page.goto('/todomvc');
  const LISTA_DE_TAREFAS = ['Ler a documentação', 'Fazer exercícios', 'Revisar'];
  const novaTarefa = page.getByPlaceholder('What needs to be done?');

  for (const titulo of LISTA_DE_TAREFAS) {
    await novaTarefa.fill(titulo);
    await novaTarefa.press('Enter');
  }

  await expect(page.getByTestId('todo-title')).toHaveText(LISTA_DE_TAREFAS);
  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(novaTarefa).toHaveValue('');
  await expect(novaTarefa).toBeFocused();

  await concluirTarefa(page, 'Fazer exercícios');

  await page.getByRole('link', { name: 'Active' }).click();

  await expect(page.getByTestId('todo-title')).toHaveText(['Ler a documentação', 'Revisar']);
});

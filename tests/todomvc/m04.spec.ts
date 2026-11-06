import { test, expect } from '@playwright/test';

test('lista mostra as tarefas na ordem em que foram criadas', async ({ page }) => {
  await page.goto('/todomvc');
  const novaTarefa = page.getByPlaceholder('What needs to be done?');

  for (const titulo of ['Ler a documentação', 'Fazer exercícios', 'Revisar']) {
    await novaTarefa.fill(titulo);
    await novaTarefa.press('Enter');
  }

  await expect(page.getByTestId('todo-title')).toHaveText([
    'Ler a documentação',
    'Fazer exercícios',
    'Revisar',
  ]);
  await expect(page.getByTestId('todo-item')).toHaveCount(3);
  await expect(novaTarefa).toHaveValue('');
  await expect(novaTarefa).toBeFocused();
});

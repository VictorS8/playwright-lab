import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('edita o texto de uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'Estudar locators');

  const tarefa = page.getByTestId('todo-title');
  await tarefa.dblclick();

  const editarTarefa = page.getByRole('textbox', { name: 'Edit' });
  // O fill ('') apaga o texto do input de maneira mais visível no código,
  // porém já foi mostrado que o fill já executa um clear
  // antes de preencher o texto
  // await editarTarefa.fill('');
  await editarTarefa.fill('Estudar fixtures');
  await editarTarefa.press('Enter');

  await expect(tarefa).toHaveText('Estudar fixtures');

});

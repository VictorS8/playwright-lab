import { test, expect } from '@playwright/test';
import { adicionarTarefa, concluirTarefa } from './helpers';

test('contador passa de 1 para 0 itens restantes ao concluir uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');

  const NOME_DA_TAREFA = "Uma tarefa";

  await adicionarTarefa(page, NOME_DA_TAREFA);

  const contadorDeTarefasFaltando = page.getByTestId("todo-count");

  await expect(contadorDeTarefasFaltando).toHaveText('1 item left');

  await concluirTarefa(page, NOME_DA_TAREFA);

  await expect(contadorDeTarefasFaltando).toHaveText('0 items left');
});

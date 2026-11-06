import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('contador mostra o número 2 com duas tarefas pendentes', async ({ page }) => {
  await page.goto('/todomvc');
  const NOME_DA_TAREFA_1 = "Tarefa 1";
  const NOME_DA_TAREFA_2 = "Tarefa 2";

  await adicionarTarefa(page, NOME_DA_TAREFA_1);
  await adicionarTarefa(page, NOME_DA_TAREFA_2);

  const contadorDeTarefasFaltando = page.getByTestId("todo-count");

  await expect(contadorDeTarefasFaltando).toContainText('2');
});

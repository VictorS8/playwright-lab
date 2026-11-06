import { test, expect } from '@playwright/test';
import { adicionarTarefa, concluirTarefa } from './helpers';

test('contador atualiza ao concluir uma tarefa, usando assertion web-first', async ({ page }) => {
  await page.goto('/todomvc');

  const NOME_DA_TAREFA = "Uma tarefa";

  await adicionarTarefa(page, NOME_DA_TAREFA);

  const contadorDeTarefasFaltando = page.getByTestId("todo-count");

  // Certo
  await expect(contadorDeTarefasFaltando).toHaveText('1 item left');

  // Errado
  // expect(await contadorDeTarefasFaltando.textContent()).toBe('1 item left');

  await concluirTarefa(page, NOME_DA_TAREFA);

  // Certo
  await expect(contadorDeTarefasFaltando).toHaveText('0 items left');

  //Errado
  // expect(await contadorDeTarefasFaltando.textContent()).toBe('0 items left');

  // R. Na versão errada o texto é lido
  // apenas uma vez em cada expect de maneira instantânea
  // e se o contador demorar para atualizar, o teste vai falhar;
  // O teste pode ser instável, pois depende do tempo de resposta instantâneo
  // Na versão certa, se o contador demorar para atualizar,
  // o expect vai aguardar até que o texto seja atualizado,
  // contando que seja dentro do timer de 5 segundos por padrão,
  // evitando falhas no teste.

});

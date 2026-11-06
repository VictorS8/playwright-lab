import { test, expect } from '@playwright/test';
import { adicionarTarefa, concluirTarefa } from './helpers';

test('botão Clear completed só aparece depois de concluir uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');

  const NOME_DA_TAREFA = "Apenas um teste";

  const botaoDeLimparCompletadas = page.getByRole('button', { name: 'Clear completed' });
  await expect(botaoDeLimparCompletadas).toBeHidden();

  await adicionarTarefa(page, NOME_DA_TAREFA);

  await expect(botaoDeLimparCompletadas).toBeHidden();

  await concluirTarefa(page, NOME_DA_TAREFA);

  await expect(botaoDeLimparCompletadas).toBeVisible();
});

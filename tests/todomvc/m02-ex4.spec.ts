import { test, expect } from '@playwright/test';

test('encontra o campo de tarefa de três formas diferentes', async ({ page }) => {
  await page.goto('/todomvc');

  // Com certeza eu usaria o getByRole.
  // Nele fica visível o tipo do componente com que o usuário interage
  // e até o texto, o que deixa o locator mais exato e específico.
  // Por isso ele é melhor tanto para a legibilidade quanto para a confiabilidade do teste.
  const campoDeTarefaPorRole = page.getByRole('textbox', { name: 'What needs to be done?' });
  const campoDeTarefaPorPlaceholder = page.getByPlaceholder('What needs to be done?');
  // CSS só para comparar, como pede o exercício 4
  const campoDeTarefaPorCss = page.locator('input.new-todo');

  await expect(campoDeTarefaPorRole).toBeVisible();
  await expect(campoDeTarefaPorPlaceholder).toBeVisible();
  await expect(campoDeTarefaPorCss).toBeVisible();
});

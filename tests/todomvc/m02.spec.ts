import { test, expect } from '@playwright/test';

test('encontra os elementos principais do TodoMVC', async ({ page }) => {
  await page.goto('/todomvc');

  // Pelo papel e nome acessível (o campo tem o placeholder como nome)
  const novaTarefa = page.getByRole('textbox', { name: 'What needs to be done?' });
  await expect(novaTarefa).toBeVisible();

  // Pelo placeholder (equivalente aqui)
  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();

  // Os filtros só aparecem com pelo menos uma tarefa (fill e press: módulo 3)
  await novaTarefa.fill('Estudar locators');
  await novaTarefa.press('Enter');

  // Link pelo nome exato
  await expect(page.getByRole('link', { name: 'All', exact: true })).toBeVisible();

  // Título da página (heading)
  await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
});

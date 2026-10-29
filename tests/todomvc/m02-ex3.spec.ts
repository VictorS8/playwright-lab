import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('a página tem 6 links depois de criar uma tarefa', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'estudar Playwright');

  const links = page.getByRole('link');

  await expect(links).toHaveCount(6);

  // O getByRole('link') encontra 6 links,
  // pois não especifica qual link deve ser manipulado

  // Error: locator.click: Error: strict mode violation: getByRole('link') resolved to 6 elements:
  //     1) <a href="https://todomvc.com/">real TodoMVC app.</a> aka getByRole('link', { name: 'real TodoMVC app.' })
  //     2) <a href="#/" class="selected">All</a> aka getByRole('link', { name: 'All' })
  //     3) <a class="" href="#/active">Active</a> aka getByRole('link', { name: 'Active' })
  //     4) <a class="" href="#/completed">Completed</a> aka getByRole('link', { name: 'Completed' })
  //     5) <a href="http://github.com/remojansen/">Remo H. Jansen</a> aka getByRole('link', { name: 'Remo H. Jansen' })
  //     6) <a href="http://todomvc.com">TodoMVC</a> aka getByRole('link', { name: 'TodoMVC', exact: true })

  // Call log:
  //   - waiting for getByRole('link')
  // await page.getByRole('link').click();
});

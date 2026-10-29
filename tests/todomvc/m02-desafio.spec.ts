import { test, expect } from '@playwright/test';
import { adicionarTarefa } from './helpers';

test('getByText acha o filtro Active quando nenhuma tarefa contém "active"', async ({ page }) => {
  await page.goto('/todomvc');

  await adicionarTarefa(page, 'estudar Playwright');

  const filtroActivePorTexto = page.getByText('Active');

  await filtroActivePorTexto.click();
  await expect(page).toHaveURL(/#\/active$/);

  // O erro está em presumir que o texto 'Active' aparece uma única vez.
  // O getByText busca qualquer texto que contenha 'Active',
  // sem diferenciar maiúsculas de minúsculas.
  // No caso atual funcionou, pois nenhuma tarefa criada
  // tinha 'active' no nome, como "Reactive account".
  // Em telas e sites com muito mais texto,
  // e principalmente com textos digitados por usuários,
  // a chance de erro aumenta muito.
  // Com mais de um elemento contendo 'active',
  // o teste falharia pelo erro de strictness visto no exercício 3 do módulo 2.
});

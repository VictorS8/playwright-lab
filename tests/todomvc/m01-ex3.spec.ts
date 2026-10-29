import { test, expect } from '@playwright/test';

test('abre o TodoMVC na rota #/', async ({ page }) => {
  await page.goto('/todomvc');

  await expect(page).toHaveURL(/#\/$/);

  // page.goto('/todomvc');

  // expect(page.url()).toContain('#/');

  // Dessa forma o teste quebra, pois nada carregou de fato
  // causando o erro abaixo

  // Error: expect(received).toContain(expected) // indexOf
  // Expected substring: "#/"
  // Received string:    "about:blank"
});

// Pelo visto o teste com toHaveURL funcionou e não quebrou,
// mesmo com o goto sem await, que não espera a página carregar.
// Como o toHaveURL tenta de novo até a URL ser a esperada,
// ele compensa o await que falta. Já o page.url() lê só uma vez,
// pegou o about:blank e gerou o erro.
// Não é uma boa prática e deixa o teste menos confiável.

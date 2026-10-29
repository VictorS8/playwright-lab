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

// Pelo visto funcionou e não quebrou o teste, 
// pois o goto sem await não espera a página carregar
// mas como o toHaveURL tenta de novo até a url ser a esperada
// então compensa o await faltando. O page.url() lê somente uma vez 
// e pegou o about:blank gerando o erro
// Não é uma boa prática e deixa o teste menos confiavel
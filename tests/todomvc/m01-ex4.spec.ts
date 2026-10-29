import { test, expect } from '@playwright/test';

test('abre o TodoMVC e checa o título', async ({ page }) => {
    await page.goto('/todomvc');

    await expect(page).toHaveTitle(/TodoMVC/);
});

test('a string exata não aceita só um trecho do título', async ({ page }) => {
    await page.goto('/todomvc');

    await expect(page).not.toHaveTitle('TodoMVC');
});

// Com toHaveTitle('TodoMVC') o teste não passava, 
// pois o título é 'React • TodoMVC'.
// Por isso aqui uso .not, pois a string exige o título inteiro.

// A expressão regular /TodoMVC/ funciona, 
// pois ela verifica se a string contém 'TodoMVC', 
// mas a verificação exata falha.

// Error: expect(page).toHaveTitle(expected) failed

// Expected: "TodoMVC"
// Received: "React • TodoMVC"
// Timeout:  5000ms

// Call log:
//   - Expect "toHaveTitle" with timeout 5000ms
//     14 × locator resolved to <html lang="en" data-framework="typescript">…</html>
//        - unexpected value "React • TodoMVC"
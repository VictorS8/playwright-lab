import { test, expect } from '@playwright/test';

test('abre o TodoMVC e verifica a url', async ({ page }) => {
    await page.goto('/todomvc');

    await expect(page).toHaveURL(/#\/$/);
});
import { test, expect } from '@playwright/test';

test('abre o TodoMVC e confere o título', async ({ page }) => {
    await page.goto('/todomvc');
    await expect(page).toHaveTitle(/TodoMVC/);
});

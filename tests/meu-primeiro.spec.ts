import { test, expect } from '@playwright/test';

test('docs has installation heading', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  const element = page.getByRole('link', { name: 'Docs' });

  await expect(element).toBeVisible();

  await element.click();

  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

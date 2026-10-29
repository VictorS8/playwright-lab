import type { Page } from '@playwright/test';

export async function adicionarTarefa(page: Page, titulo: string) {
  const campo = page.getByRole('textbox', { name: 'What needs to be done?' });
  await campo.fill(titulo);
  await campo.press('Enter');
}

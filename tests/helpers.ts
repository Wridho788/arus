import { expect, type Locator, type Page } from '@playwright/test';

export const storageKey = 'arus.personal-finance.v1';

export async function openApp(page: Page) {
  await page.clock.setFixedTime(new Date('2026-10-04T10:00:00+07:00'));
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Ringkasan keuangan' })).toBeVisible();
}

export async function navigate(page: Page, name: string) {
  const menu = page.getByRole('button', { name: 'Buka menu', exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name, exact: true }).click();
}

export async function expectMoney(locator: Locator, formatted: string) {
  await expect(locator).toContainText(new RegExp(`Rp\\s*${formatted.replaceAll('.', '\\.')}`));
}

export async function addExpense(page: Page, title: string, amount: string, category = 'food') {
  await page.getByRole('button', { name: 'Catat transaksi', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Tambah transaksi' });
  await dialog.getByLabel('Judul transaksi').fill(title);
  await dialog.getByLabel('Nominal (Rp)').fill(amount);
  await dialog.getByRole('combobox', { name: 'Kategori', exact: true }).selectOption(category);
  await dialog.getByRole('button', { name: 'Simpan transaksi', exact: true }).click();
  await expect(dialog).toHaveCount(0);
}

export async function expectNoOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

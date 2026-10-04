import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
});

test('transaction create, edit, reload, and delete update the month', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Transaksi' }).click();
  await page.getByRole('button', { name: 'Catat transaksi' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tambah transaksi' });
  await dialog.getByLabel('Judul transaksi').fill('Tes makan');
  await dialog.getByLabel('Nominal (Rp)').fill('50000');
  await dialog.getByRole('button', { name: 'Simpan transaksi' }).click();
  await expect(page.locator('.transaction-row').filter({ hasText: 'Tes makan' })).toContainText(/Rp\s*50\.000/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Transaksi' }).click();
  await expect(page.locator('.transaction-row').filter({ hasText: 'Tes makan' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Tes makan' }).click();
  await page.getByRole('dialog', { name: 'Edit transaksi' }).getByLabel('Nominal (Rp)').fill('70000');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.locator('.transaction-row').filter({ hasText: 'Tes makan' })).toContainText(/Rp\s*70\.000/);

  page.once('dialog', (confirmation) => confirmation.accept());
  await page.getByRole('button', { name: 'Hapus Tes makan' }).click();
  await expect(page.locator('.transaction-row').filter({ hasText: 'Tes makan' })).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Ringkasan' }).click();
  await expect(page.locator('.summary-card').filter({ hasText: 'Total pengeluaran' })).toContainText(/Rp\s*4\.011\.000/);
});

test('budget create and reset restore the demo state', async ({ page }) => {
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Anggaran' }).click();
  await page.getByRole('button', { name: 'Buat anggaran' }).click();
  const dialog = page.getByRole('dialog', { name: 'Tambah anggaran' });
  await dialog.getByLabel('Kategori').selectOption('health');
  await dialog.getByLabel('Batas pengeluaran (Rp)').fill('500000');
  await dialog.getByRole('button', { name: 'Buat anggaran' }).click();
  await expect(page.locator('.budget-card').filter({ hasText: 'Kesehatan' })).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Anggaran' }).click();
  await expect(page.locator('.budget-card').filter({ hasText: 'Kesehatan' })).toBeVisible();

  page.once('dialog', (confirmation) => confirmation.accept());
  await page.getByRole('button', { name: 'Atur ulang data contoh' }).click();
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Anggaran' }).click();
  await expect(page.locator('.budget-card').filter({ hasText: 'Kesehatan' })).toHaveCount(0);
});

test('landing and app remain usable at phone width', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Uangmu lebih jelas/ })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Coba demo gratis' }).click();
  await expect(page.getByRole('heading', { name: 'Ringkasan keuangan' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Buka menu' }).click();
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Transaksi' }).click();
  await expect(page.getByRole('heading', { name: 'Semua transaksi' })).toBeVisible();
});

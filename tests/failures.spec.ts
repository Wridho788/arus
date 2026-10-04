import { test, expect, type Page } from '@playwright/test';

const storageKey = 'arus.personal-finance.v1';

async function simulateWriteFailure(page: Page) {
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && sessionStorage.getItem('fail-write') === 'yes') {
        throw new DOMException('Storage full', 'QuotaExceededError');
      }
      original.call(this, key, value);
    };
    sessionStorage.setItem('fail-write', 'yes');
  });
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-04T10:00:00+07:00'));
  await page.goto('/app', { waitUntil: 'domcontentloaded' });
});

test('category and type filters combine with search without changing totals', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Navigasi aplikasi' });
  await nav.getByRole('button', { name: 'Transaksi', exact: true }).click();
  await page.getByLabel('Filter kategori').selectOption('food');
  await expect(page.locator('.transaction-row')).toHaveCount(3);
  await page.getByLabel('Cari transaksi').fill('KOPI');
  await expect(page.locator('.transaction-row')).toHaveCount(1);
  await expect(page.locator('.transaction-row')).toContainText('Kopi & sarapan');
  await page.getByLabel('Cari transaksi').fill('tidak-ada-hasil');
  await expect(page.getByText('Tidak ada transaksi yang cocok')).toBeVisible();
  await page.getByRole('button', { name: 'Hapus filter' }).click();
  await expect(page.locator('.transaction-row')).toHaveCount(10);
  await page.getByRole('group', { name: 'Filter transaksi' }).getByRole('button', { name: 'Pemasukan', exact: true }).click();
  await page.getByLabel('Filter kategori').selectOption('salary');
  await expect(page.locator('.transaction-row')).toHaveCount(1);
  await nav.getByRole('button', { name: 'Ringkasan', exact: true }).click();
  await expect(page.locator('.summary-card').filter({ hasText: 'Total pengeluaran' })).toContainText(/Rp\s*4\.011\.000/);
  await expect(page.locator('.summary-card').filter({ hasText: 'Total pemasukan' })).toContainText(/Rp\s*10\.250\.000/);
});

for (const kind of ['transaction', 'budget'] as const) {
  test(`${kind} save failure is announced inside the form and can be retried`, async ({ page }) => {
    const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);
    if (kind === 'budget') {
      await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Anggaran', exact: true }).click();
    }
    await page.getByRole('button', { name: kind === 'transaction' ? 'Catat transaksi' : 'Buat anggaran', exact: true }).click();
    const dialog = page.getByRole('dialog');
    if (kind === 'transaction') await dialog.getByLabel('Judul transaksi').fill('Simpan ulang');
    await dialog.getByLabel(kind === 'transaction' ? 'Nominal (Rp)' : 'Batas pengeluaran (Rp)').fill('50000');
    await simulateWriteFailure(page);
    await dialog.getByRole('button', { name: kind === 'transaction' ? 'Simpan transaksi' : 'Buat anggaran', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Penyimpanan browser tidak tersedia');
    await expect(dialog).toBeVisible();
    expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
    await page.evaluate(() => sessionStorage.removeItem('fail-write'));
    await dialog.getByRole('button', { name: kind === 'transaction' ? 'Simpan transaksi' : 'Buat anggaran', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const after = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
    expect(after[kind === 'transaction' ? 'transactions' : 'budgets']).toHaveLength(kind === 'transaction' ? 11 : 5);
  });
}

test('failed recovery reset reports the error and preserves corrupt data until retry', async ({ page }) => {
  await page.evaluate((key) => localStorage.setItem(key, '{broken'), storageKey);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Data belum bisa dibuka' })).toBeVisible();
  await simulateWriteFailure(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Atur ulang data contoh' }).click();
  await expect(page.getByRole('alert')).toContainText('Penyimpanan browser tidak tersedia');
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('{broken');
  await page.evaluate(() => sessionStorage.removeItem('fail-write'));
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Atur ulang data contoh' }).click();
  await expect(page.getByRole('heading', { name: 'Ringkasan keuangan' })).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Ringkasan keuangan' })).toBeVisible();
});

test('storage read denial can be retried without destroying saved records', async ({ page }) => {
  const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  await page.addInitScript(() => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (this === localStorage && sessionStorage.getItem('deny-read') !== 'off') throw new DOMException('Denied', 'SecurityError');
      return original.call(this, key);
    };
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Data belum bisa dibuka' })).toBeVisible();
  await page.getByRole('button', { name: 'Coba buka lagi' }).click();
  await expect(page.getByRole('alert')).toContainText('Penyimpanan browser tidak tersedia');
  await page.evaluate(() => sessionStorage.setItem('deny-read', 'off'));
  await page.getByRole('button', { name: 'Coba buka lagi' }).click();
  await expect(page.getByRole('heading', { name: 'Ringkasan keuangan' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
});

test('failed deletion keeps the visible record and reports an error instead of success', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Transaksi', exact: true }).click();
  const before = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  await simulateWriteFailure(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Hapus Kopi & sarapan', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Penyimpanan browser tidak tersedia');
  await expect(page.locator('.transaction-row').filter({ hasText: 'Kopi & sarapan' })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(before);
});

test('unsupported data version is preserved until reset is explicitly confirmed', async ({ page }) => {
  const future = JSON.stringify({ version: 2, transactions: [], budgets: [] });
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: future });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Data belum bisa dibuka' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Atur ulang data contoh' }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe(future);
});

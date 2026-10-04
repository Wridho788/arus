import { test, expect } from '@playwright/test';
import { addExpense, expectMoney, expectNoOverflow, navigate, openApp } from './helpers';

for (const viewport of [{ width: 360, height: 780 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`MVP walkthrough and layout at ${viewport.width}px`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Uangmu lebih jelas/ })).toBeVisible();
    await expectNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('landing.png'), fullPage: true, animations: 'disabled' });
    await page.getByRole('link', { name: 'Coba demo gratis' }).click();
    await expect(page.getByRole('heading', { name: 'Ringkasan keuangan' })).toBeVisible();
    await expectNoOverflow(page);
    await expect(page.getByText('Mode demo', { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('overview.png'), fullPage: true, animations: 'disabled' });
    await navigate(page, 'Transaksi');
    await addExpense(page, 'Belanja kebutuhan keluarga untuk perjalanan akhir pekan', '250000');
    const row = page.locator('.transaction-row').filter({ hasText: 'Belanja kebutuhan keluarga' });
    await expectMoney(row, '250.000');
    await expectNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('transactions.png'), fullPage: true, animations: 'disabled' });
    await row.getByRole('button', { name: /^Edit / }).click();
    const form = page.getByRole('dialog', { name: 'Edit transaksi' });
    await form.getByLabel('Nominal (Rp)').fill('300000');
    await form.screenshot({ path: testInfo.outputPath('transaction-form.png'), animations: 'disabled' });
    await expect.poll(() => form.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await form.getByRole('button', { name: 'Simpan perubahan' }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await navigate(page, 'Transaksi');
    await expectMoney(row, '300.000');
    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: /^Hapus / }).click();
    await expect(row).toHaveCount(0);
    await navigate(page, 'Anggaran');
    await page.getByRole('button', { name: 'Buat anggaran', exact: true }).click();
    const budget = page.getByRole('dialog', { name: 'Tambah anggaran' });
    await budget.getByRole('combobox', { name: 'Kategori', exact: true }).selectOption('health');
    await budget.getByLabel('Batas pengeluaran (Rp)').fill('500000');
    await budget.screenshot({ path: testInfo.outputPath('budget-form.png'), animations: 'disabled' });
    await budget.getByRole('button', { name: 'Buat anggaran', exact: true }).click();
    await expect(page.locator('.budget-card').filter({ hasText: 'Kesehatan' })).toBeVisible();
    await expectNoOverflow(page);
    await page.screenshot({ path: testInfo.outputPath('budgets.png'), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'Edit anggaran Kesehatan', exact: true }).click();
    await page.getByRole('dialog').getByLabel('Batas pengeluaran (Rp)').fill('600000');
    await page.getByRole('dialog').getByRole('button', { name: 'Simpan perubahan' }).click();
    await expectMoney(page.locator('.budget-card').filter({ hasText: 'Kesehatan' }), '600.000');
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Hapus anggaran Kesehatan', exact: true }).click();
    await expect(page.locator('.budget-card').filter({ hasText: 'Kesehatan' })).toHaveCount(0);
  });
}

test('keyboard dialog focus is contained, Escape closes it and focus returns to its trigger', async ({ page }) => {
  await openApp(page);
  const trigger = page.getByRole('button', { name: 'Catat transaksi', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Tambah transaksi' });
  await expect(dialog.getByLabel('Judul transaksi')).toBeFocused();
  for (let index = 0; index < 16; index++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByLabel('Judul transaksi').fill('Keyboard');
  await page.keyboard.press('Tab');
  await page.keyboard.type('20000');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expectMoney(page.locator('.summary-card').filter({ hasText: 'Total pengeluaran' }), '4.031.000');
});

test('phone menu excludes hidden controls, traps focus and restores focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await openApp(page);
  await page.keyboard.press('Tab');
  const trigger = page.getByRole('button', { name: 'Buka menu', exact: true });
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('dialog', { name: 'Menu aplikasi' });
  await expect(menu.getByRole('button', { name: 'Tutup menu', exact: true })).toBeFocused();
  for (let index = 0; index < 10; index++) {
    await page.keyboard.press('Tab');
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name: 'Transaksi', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Semua transaksi' })).toBeVisible();
  await expect(trigger).toBeFocused();
});

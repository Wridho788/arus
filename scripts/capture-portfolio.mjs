/* global document */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import process from 'node:process';
import console from 'node:console';
import path from 'node:path';
import { preview } from 'vite';
import { chromium } from 'playwright';

// Capture the actual static build; no generated UI mockups or user data.
const server = await preview({ preview: { host: '127.0.0.1', port: 4176, strictPort: true } });
let browser;
const output = path.resolve('docs/portfolio/screenshots');
const captures = [];
try {
  await mkdir(output, { recursive: true });
  browser = await chromium.launch();
  for (const [device, viewport] of [
    ['desktop', { width: 1440, height: 900 }],
    ['tablet', { width: 768, height: 1024 }],
    ['phone', { width: 360, height: 780 }],
  ]) {
    const context = await browser.newContext({ viewport, locale: 'id-ID', timezoneId: 'Asia/Jakarta', reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.clock.setFixedTime(new Date('2026-10-15T10:00:00+07:00'));
    const baseURL = server.resolvedUrls.local[0];
    async function capture(screen) {
      await page.evaluate(async () => { await document.fonts.ready; document.activeElement?.blur(); });
      await page.evaluate(() => { document.documentElement.scrollTop = 0; document.body.scrollTop = 0; });
      const file = `${screen}-${device}.png`;
      await page.screenshot({ path: path.join(output, file), fullPage: true, animations: 'disabled' });
      const bytes = await readFile(path.join(output, file));
      captures.push({ file, screen, viewport, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
      console.log(`Captured ${file}`);
    }
    if (device !== 'tablet') {
      await page.goto(baseURL, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: /Uangmu lebih jelas/ }).waitFor();
      await capture('landing');
    }
    await page.goto(`${baseURL}app`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Ringkasan keuangan' }).waitFor();
    await capture('dashboard');
    if (device !== 'tablet') {
      for (const [name, screen] of [['Transaksi', 'transactions'], ['Anggaran', 'budgets']]) {
        const menu = page.getByRole('button', { name: 'Buka menu', exact: true });
        if (await menu.isVisible()) await menu.click();
        await page.getByRole('navigation', { name: 'Navigasi aplikasi' }).getByRole('button', { name, exact: true }).click();
        await capture(screen);
      }
    }
    await context.close();
  }
  const html = await readFile('dist/index.html', 'utf8');
  const assets = [];
  for (const [, file] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    const bytes = await readFile(path.join('dist', file.slice(1)));
    assets.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify({ capturedAt: new Date().toISOString(), source: 'Local Vite production preview', demoDate: '2026-10-15', browser: browser.version(), assets, captures }, null, 2)}\n`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}

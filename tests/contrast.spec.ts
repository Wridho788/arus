import { test, expect } from '@playwright/test';
import { navigate, openApp } from './helpers';

test('primary text on solid surfaces meets the normal or large-text contrast target', async ({ page }) => {
  async function checkText(screen: string) {
    const failures = await page.evaluate(() => {
      const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
      const luminance = (values: number[]) => values.slice(0, 3)
        .map((value) => value / 255)
        .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const failures: { text: string; ratio: number; threshold: number }[] = [];
      for (const element of document.querySelectorAll('body *')) {
        // Decorative mockups, logos, and gradient artwork need a visual review;
        // this check deliberately covers primary UI copy on opaque backgrounds.
        if (!(element instanceof HTMLElement) || !element.checkVisibility() ||
          element.closest('[inert],.hero-art,.feature-visual,.last-cta-shape,.banner-symbol,.card-decoration,.logo')) continue;
        const text = [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent).join('').trim();
        if (!text || !/[A-Za-z0-9]/.test(text)) continue;
        const style = getComputedStyle(element);
        let background = [255, 255, 255];
        for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
          const color = rgb(getComputedStyle(parent).backgroundColor);
          if (color.length === 3 || color[3] === 1) { background = color; break; }
        }
        const light = [luminance(rgb(style.color)), luminance(background)].sort((a, b) => a - b);
        const ratio = (light[1] + 0.05) / (light[0] + 0.05);
        const size = parseFloat(style.fontSize);
        const threshold = size >= 24 || (size >= 18.67 && Number(style.fontWeight) >= 700) ? 3 : 4.5;
        if (ratio < threshold) failures.push({ text: text.slice(0, 80), ratio, threshold });
      }
      return failures;
    });
    expect(failures, screen).toEqual([]);
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Uangmu lebih jelas/ })).toBeVisible();
  await checkText('landing');
  await openApp(page);
  await checkText('overview');
  await navigate(page, 'Transaksi');
  await checkText('transactions');
  await navigate(page, 'Anggaran');
  await checkText('budgets');
});

import { defineConfig } from '@playwright/test';
import base from './playwright.config';

const deployedURL = process.env.PLAYWRIGHT_BASE_URL;
const baseURL = deployedURL ?? 'http://127.0.0.1:4175';
const outputDir = deployedURL ? 'test-results/deployed' : 'test-results/production';

export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: deployedURL ? '**/release/*.spec.ts' : '**/*.spec.ts',
  outputDir,
  reporter: [['list'], ['json', { outputFile: `${outputDir}/results.json` }]],
  use: { ...base.use, baseURL },
  webServer: deployedURL ? [] : {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4175 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});

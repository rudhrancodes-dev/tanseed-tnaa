import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 60000,
  use: {
    launchOptions: {
      args: ['--disable-web-security', '--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
});

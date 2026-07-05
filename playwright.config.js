const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter config: gerará o relatório HTML na pasta playwright-report
  reporter: 'html',

  use: {
    actionTimeout: 0,
    trace: 'on-first-retry',
    // Tirar screenshot no final de cada teste ou quando falhar
    screenshot: 'on',
    video: 'retain-on-failure',
    baseURL: 'http://localhost:5173',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Inicia o frontend e o backend simultaneamente usando concurrently
  webServer: {
    command: 'npx concurrently "npm run dev:api" "npm run dev:web"',
    url: 'http://localhost:5173', // Espera o frontend ficar online
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutos para ambos subirem na primeira vez
  },
});

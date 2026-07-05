const { test, expect } = require('@playwright/test');

test.describe('Metropolys App', () => {
  test('Deve carregar a página inicial e capturar snapshot', async ({ page }) => {
    // A baseURL já está configurada no playwright.config.js como http://localhost:5173
    await page.goto('/');
    
    // Verifica se a página subiu corretamente (pode ser o título ou qualquer elemento no Vue)
    // Se o título não for Metropolys, esse teste vai falhar, e poderemos ajustar depois de ver.
    await expect(page).toHaveTitle(/Vite App|Metropolys/i);

    // O Playwright também está configurado para tirar um screenshot global no final de todo teste (screenshot: 'on').
    // Mesmo assim, podemos fazer um assert visual opcional aqui se quiséssemos.
    // await expect(page).toHaveScreenshot('home-snapshot.png');
  });
});

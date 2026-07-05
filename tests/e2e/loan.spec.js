const { test, expect } = require('@playwright/test');

test.describe('Fluxo de Empréstimo', () => {
  test('Deve solicitar e receber um empréstimo do banco na UI', async ({ page }) => {
    await page.goto('/');

    // 1. Iniciar partida local
    await page.click('button:has-text("Jogar Local")');

    // 2. Confirmar seleção de cidade
    await page.click('button:has-text("Confirmar")');

    // 3. Aguardar carregamento da partida
    await expect(page.locator('.hud-title-main')).toContainText('METROPOLYS');
    await page.waitForTimeout(1000);

    // 4. Aguardar o botão ficar habilitado (fim das animações) e clicar
    const loanButton = page.locator('.loan-trigger-btn');
    await expect(loanButton).toBeEnabled({ timeout: 15000 });
    await loanButton.dispatchEvent('click');

    // 5. Validar que o modal abriu procurando pelos botões de valores
    const btn300 = page.locator('.loan-select-btn', { hasText: '300' });
    await expect(btn300).toBeVisible({ timeout: 5000 });

    // 6. Solicitar um empréstimo de 300M
    await btn300.click({ force: true });

    // 7. Opcional: O modal deve fechar
    await expect(btn300).toBeHidden({ timeout: 5000 });
  });
});

const { test, expect } = require('@playwright/test');

test.describe('Fluxo de Compra de Propriedade', () => {
  test('Deve realizar a compra de uma propriedade no jogo local', async ({ page }) => {
    await page.goto('/');

    // 1. Iniciar partida local
    await page.click('button:has-text("Jogar Local")');

    // 2. Confirmar seleção de cidade
    await page.click('button:has-text("Confirmar")');

    // 3. Aguardar carregamento da partida
    await expect(page.locator('.hud-title-main')).toContainText('METROPOLYS');

    // Wait a brief moment to ensure UI is mounted
    await page.waitForTimeout(1000);

    // 4. Invocar diretamente o evento de chegada num lote de propriedade (Slot 1 - Avenida Paulista A)
    // Isso ignora a animação do Phaser e foca na lógica e HUD de compra (Regra de E2E Resiliente)
    await page.evaluate(() => {
      window.gameStore.onMovementComplete(1);
    });

    // 5. Verificar se o painel de compra apareceu
    // O slot 1 é "Avenida Paulista A" e deve estar disponível
    const buyButton = page.getByRole('button', { name: 'Comprar', exact: true });
    await expect(buyButton).toBeVisible({ timeout: 5000 });

    // 6. Comprar a propriedade
    await buyButton.click();

    // 7. Verificar se a propriedade foi adicionada ao inventário do jogador (HUD)
    const propertyBadge = page.locator('.property-hud-badge').first();
    await expect(propertyBadge).toBeVisible({ timeout: 5000 });
  });
});

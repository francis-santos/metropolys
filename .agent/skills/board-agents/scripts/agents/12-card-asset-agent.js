const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class CardAssetAgent extends BaseAgent {
  constructor() {
    super(
      'card-asset-agent',
      'Agente de Recursos',
      'GAMEPLAY',
      'Gerencia o deck de cartas de evento e itens especiais dos jogadores.'
    );
    this.metrics = { cardsDrawn: 0, totalImpact: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'INPUT_RECEIVED' && event.payload.action === 'DRAW_CARD') {
      const state = getState();
      const { player } = event.payload;
      const card = state.cards[Math.floor(Math.random() * state.cards.length)];

      let amount = card.amount;
      if (card.perProperty) {
        const owned = state.properties.filter(p => p.ownerId === player.id).length;
        amount = card.amount * Math.max(owned, 1);
      }
      player.money += amount;
      this.metrics.cardsDrawn++;
      this.metrics.totalImpact += amount;

      await bus.dispatch('NOTIFICATION_TRIGGERED', {
        text: `CARTA: ${player.name} — "${card.text}" (${amount > 0 ? '+' : ''}${amount}M. Saldo: ${player.money}M)`
      });
    }
  }

  async selfTest() {
    const state = getState();
    if (state.cards.length < 4) return { passed: false, message: `Deck muito pequeno: ${state.cards.length} cartas.` };
    return { passed: true, message: `Deck com ${state.cards.length} cartas carregado.` };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Deck de Cartas de Evento:')}\n`);
    state.cards.forEach((card, i) => {
      const icon = card.amount > 0 ? `${COLORS.GREEN}+${card.amount}M${COLORS.RESET}` : `${COLORS.RED}${card.amount}M${COLORS.RESET}`;
      const perProp = card.perProperty ? ` ${COLORS.YELLOW}(por propriedade)${COLORS.RESET}` : '';
      console.log(`  ${String(i + 1).padStart(2)}. ${icon.padEnd(18)} ${card.text}${perProp}`);
    });

    console.log(`\n  ${bold('Sorteio de teste:')}`);
    const card = state.cards[Math.floor(Math.random() * state.cards.length)];
    console.log(`  🎴 "${card.text}" (${card.amount > 0 ? '+' : ''}${card.amount}M)`);
  }
}

module.exports = CardAssetAgent;
if (require.main === module) runAgentCLI(CardAssetAgent);

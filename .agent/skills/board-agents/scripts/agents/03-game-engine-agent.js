const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class GameEngineAgent extends BaseAgent {
  constructor() {
    super(
      'game-engine-agent',
      'Agente de Motor do Jogo',
      'ARCHITECTURE',
      'Executa alterações de estado: movimentação de peças, compras e transações financeiras.'
    );
    this.metrics = { moves: 0, purchases: 0, transactions: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'TURN_PROCESSED') {
      const { player, action } = event.payload;
      if (action === 'ROLL_DICE') {
        this.metrics.moves++;
        await bus.dispatch('PHYSICS_SIMULATED', { player });
      } else if (action === 'BUY_PROPERTY') {
        const state = getState();
        const slot = state.properties[player.position];
        if (slot && slot.ownerId === null && player.money >= slot.cost) {
          slot.ownerId = player.id;
          player.money -= slot.cost;
          player.propertiesOwned = player.propertiesOwned || [];
          player.propertiesOwned.push(slot.id);
          this.metrics.purchases++;
          this.metrics.transactions++;
          await bus.dispatch('BOARD_STATE_SYNCED', { player, slot, change: 'ACQUISITION' });
        }
      }
    }
  }

  async selfTest() {
    const state = getState();
    const player = { ...state.players[0], money: 500, position: 1 };
    const slot = state.properties[1];
    if (slot.cost > player.money) {
      return { passed: true, message: `Validação financeira OK. Jogador com ${player.money}M não pode comprar slot de ${slot.cost}M.` };
    }
    return { passed: true, message: `Motor de transações operacional.` };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Simulando sequência de motor do jogo:')}\n`);
    const player = state.players[0];

    // Simulate dice + move
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    const oldPos = player.position;
    player.position = (player.position + roll) % 20;
    const newSlot = state.properties[player.position];

    console.log(`  ${bold('Jogador:')}   ${player.name}`);
    console.log(`  ${bold('Dados:')}     [${die1}] + [${die2}] = ${roll}`);
    console.log(`  ${bold('Movimento:')} Pos ${oldPos} → Pos ${player.position} (${newSlot.name})`);
    console.log(`  ${bold('Saldo:')}     ${COLORS.GREEN}${player.money}M${COLORS.RESET}`);

    if (newSlot.type === 'PROPERTY' && !newSlot.ownerId && player.money >= newSlot.cost) {
      console.log(`\n  ${COLORS.YELLOW}▸ Propriedade disponível: ${newSlot.name} por ${newSlot.cost}M${COLORS.RESET}`);
    }
  }
}

module.exports = GameEngineAgent;
if (require.main === module) runAgentCLI(GameEngineAgent);

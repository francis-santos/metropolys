const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState, getSlotName } = require('../lib/mock-state');

class BoardStateAgent extends BaseAgent {
  constructor() {
    super(
      'board-state-agent',
      'Agente de Estado do Tabuleiro',
      'GAMEPLAY',
      'Provê representação em tempo real das posições, posses e estado visual do tabuleiro.'
    );
    this.metrics = { syncs: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'BOARD_STATE_SYNCED') {
      this.metrics.syncs++;
      const { player, slot, change } = event.payload;
      if (change === 'ACQUISITION') {
        await bus.dispatch('NOTIFICATION_TRIGGERED', {
          text: `PROPRIEDADE ADQUIRIDA: ${player.name} comprou ${slot.name} por ${slot.cost}M.`
        });
      }
    }
  }

  async selfTest() {
    const state = getState();
    if (state.properties.length !== 20) return { passed: false, message: `Esperado 20 slots, encontrado ${state.properties.length}.` };
    return { passed: true, message: '20 slots do tabuleiro carregados e íntegros.' };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Mapa do Tabuleiro:')}\n`);

    state.properties.forEach((slot, i) => {
      const owner = slot.ownerId ? state.players.find(p => p.id === slot.ownerId) : null;
      const players = state.players.filter(p => p.position === i && !p.isBankrupt);
      const ownerStr = owner ? `${COLORS.YELLOW}Dono: ${owner.name}${COLORS.RESET}` : `${COLORS.GRAY}Sem dono${COLORS.RESET}`;
      const playersStr = players.length > 0 ? ` ${COLORS.CYAN}[${players.map(p => p.name.split(' ')[0]).join(', ')}]${COLORS.RESET}` : '';
      const typeIcon = slot.type === 'START' ? '🚩' : slot.type === 'TAX' ? '💰' : slot.type === 'EVENT' ? '🎲' : '🏠';

      console.log(
        `  ${String(i).padStart(2)}. ${typeIcon} ${slot.name.padEnd(22)} ` +
        `${slot.type === 'PROPERTY' ? `${slot.cost}M`.padStart(5) : '  —  '} ` +
        `${slot.type === 'PROPERTY' ? ownerStr : COLORS.GRAY + slot.type + COLORS.RESET}${playersStr}`
      );
    });
  }
}

module.exports = BoardStateAgent;
if (require.main === module) runAgentCLI(BoardStateAgent);

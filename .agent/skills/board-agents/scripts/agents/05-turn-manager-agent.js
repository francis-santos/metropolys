const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState, advanceTurn } = require('../lib/mock-state');

class TurnManagerAgent extends BaseAgent {
  constructor() {
    super(
      'turn-manager-agent',
      'Agente de Turnos',
      'SERVICES',
      'Orquestra a ordem de turnos dos jogadores, fases e incremento de rodadas.'
    );
    this.metrics = { turnsProcessed: 0, roundsCompleted: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'ACTION_VALIDATED') {
      const { player, action } = event.payload;
      this.metrics.turnsProcessed++;
      await bus.dispatch('TURN_PROCESSED', { player, action });
    }
  }

  async selfTest() {
    const state = getState();
    const alive = state.players.filter(p => !p.isBankrupt);
    if (alive.length < 2) return { passed: false, message: 'Menos de 2 jogadores ativos.' };
    return { passed: true, message: `${alive.length} jogadores ativos. Rotação de turnos operacional.` };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Simulando rotação de 6 turnos:')}\n`);
    for (let i = 0; i < 6; i++) {
      const current = state.players[state.activePlayerIndex];
      const marker = current.isBot ? `${COLORS.YELLOW}[BOT]${COLORS.RESET}` : `${COLORS.CYAN}[HUMANO]${COLORS.RESET}`;
      console.log(`  Turno ${i + 1}: ${bold(current.name)} ${marker}`);
      advanceTurn();
    }
  }
}

module.exports = TurnManagerAgent;
if (require.main === module) runAgentCLI(TurnManagerAgent);

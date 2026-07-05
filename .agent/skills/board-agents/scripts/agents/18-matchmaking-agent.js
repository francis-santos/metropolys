const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class MatchmakingAgent extends BaseAgent {
  constructor() {
    super(
      'matchmaking-agent',
      'Agente de Pareamento',
      'SOCIAL',
      'Gerencia lobbies, pareamento de salas e verifica conectividade dos jogadores.'
    );
    this.metrics = { lobbiesCreated: 0, playersMatched: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'MATCH_START_REQUEST') {
      this.metrics.lobbiesCreated++;
      this.metrics.playersMatched += getState().players.length;
      await bus.dispatch('NOTIFICATION_TRIGGERED', {
        text: 'LOBBY INICIALIZADO: Pareando jogadores para Metropolys.'
      });
    }
  }

  async selfTest() {
    const state = getState();
    const hasEnoughPlayers = state.players.length >= 2;
    return { passed: hasEnoughPlayers, message: hasEnoughPlayers
      ? `${state.players.length} jogadores prontos para pareamento.`
      : 'Jogadores insuficientes para iniciar partida.' };
  }

  async runStandalone() {
    const state = getState();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    console.log(`  ${bold('Simulação de Matchmaking:')}\n`);
    console.log(`  ${bold('Código da Sala:')}  ${COLORS.CYAN}${code}${COLORS.RESET}`);
    console.log(`  ${bold('Cidade:')}           Salvador`);
    console.log(`  ${bold('Status:')}           ${COLORS.GREEN}LOBBY ABERTO${COLORS.RESET}`);
    console.log(`  ${bold('Jogadores:')}\n`);

    state.players.forEach((p, i) => {
      const status = `${COLORS.GREEN}● ONLINE${COLORS.RESET}`;
      const host = i === 0 ? ` ${COLORS.YELLOW}(HOST)${COLORS.RESET}` : '';
      console.log(`    ${i + 1}. ${p.name.padEnd(25)} ${status}${host}`);
    });

    console.log(`\n  ${COLORS.GREEN}✔ Sala pronta para iniciar (${state.players.length}/4 jogadores).${COLORS.RESET}`);
  }
}

module.exports = MatchmakingAgent;
if (require.main === module) runAgentCLI(MatchmakingAgent);

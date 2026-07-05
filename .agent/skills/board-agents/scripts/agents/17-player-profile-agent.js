const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class PlayerProfileAgent extends BaseAgent {
  constructor() {
    super(
      'player-profile-agent',
      'Agente de Perfil',
      'SOCIAL',
      'Gerencia histórico de partidas, vitórias/derrotas, cores de pin e estatísticas de perfil.'
    );
  }

  async handleEvent(event, bus) {}

  async selfTest() {
    const state = getState();
    return { passed: true, message: `${state.players.length} perfis de jogadores carregados.` };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Fichas de Perfil dos Jogadores:')}\n`);

    state.players.forEach(p => {
      const owned = state.properties.filter(s => s.ownerId === p.id);
      const netWorth = p.money + owned.reduce((sum, s) => sum + s.cost, 0);
      const typeTag = p.isBot ? `${COLORS.YELLOW}[BOT: ${p.personality}]${COLORS.RESET}` : `${COLORS.CYAN}[HUMANO]${COLORS.RESET}`;

      console.log(`  ┌${'─'.repeat(40)}`);
      console.log(`  │ ${bold(p.name)} ${typeTag}`);
      console.log(`  │ Pin: ${p.pin}  |  Posição: ${p.position}`);
      console.log(`  │ Saldo: ${COLORS.GREEN}${p.money}M${COLORS.RESET}  |  Patrimônio: ${COLORS.YELLOW}${netWorth}M${COLORS.RESET}`);
      console.log(`  │ Propriedades: ${owned.length}`);
      console.log(`  │ Status: ${p.isBankrupt ? `${COLORS.RED}FALIDO${COLORS.RESET}` : `${COLORS.GREEN}ATIVO${COLORS.RESET}`}`);
      console.log(`  └${'─'.repeat(40)}\n`);
    });
  }
}

module.exports = PlayerProfileAgent;
if (require.main === module) runAgentCLI(PlayerProfileAgent);

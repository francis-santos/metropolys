const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState, getActivePlayer } = require('../lib/mock-state');
const readline = require('readline');

class HumanPlayerAgent extends BaseAgent {
  constructor() {
    super(
      'human-player-agent',
      'Jogador Humano',
      'SOCIAL',
      'Representa o jogador humano: recebe decisões estratégicas e interage com o sistema.'
    );
    this.metrics = { actionsPerformed: 0 };
  }

  async handleEvent(event, bus) {
    // Human player is represented by the Input Agent's actions.
  }

  async selfTest() {
    const state = getState();
    const humans = state.players.filter(p => !p.isBot);
    return { passed: humans.length > 0, message: `${humans.length} jogador(es) humano(s) registrado(s).` };
  }

  async runStandalone() {
    const state = getState();
    const player = state.players.find(p => !p.isBot) || getActivePlayer();

    console.log(`  ${bold('Painel do Jogador Humano:')}\n`);
    console.log(`  ${bold('Nome:')}       ${player.name}`);
    console.log(`  ${bold('Saldo:')}      ${COLORS.GREEN}${player.money}M${COLORS.RESET}`);
    console.log(`  ${bold('Posição:')}    ${player.position} (${state.properties[player.position].name})`);
    console.log(`  ${bold('Pin:')}        ${player.pin}`);

    const owned = state.properties.filter(s => s.ownerId === player.id);
    console.log(`  ${bold('Propriedades:')} ${owned.length}`);
    owned.forEach(s => {
      console.log(`    • ${s.name} (Custo: ${s.cost}M, Aluguel: ${s.rent}M)`);
    });

    console.log(`\n  ${bold('Ações disponíveis:')}`);
    console.log(`    ${COLORS.GREEN}▸${COLORS.RESET} Rolar dados (roll)`);
    const currentSlot = state.properties[player.position];
    if (currentSlot.type === 'PROPERTY' && !currentSlot.ownerId && player.money >= currentSlot.cost) {
      console.log(`    ${COLORS.GREEN}▸${COLORS.RESET} Comprar ${currentSlot.name} por ${currentSlot.cost}M (buy)`);
    }
    console.log(`    ${COLORS.GREEN}▸${COLORS.RESET} Sortear carta de evento (card)`);
  }
}

module.exports = HumanPlayerAgent;
if (require.main === module) runAgentCLI(HumanPlayerAgent);

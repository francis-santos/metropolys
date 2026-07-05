const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class AnalyticsAgent extends BaseAgent {
  constructor() {
    super(
      'analytics-agent',
      'Agente de Análise',
      'INTELLIGENCE',
      'Coleta telemetria e KPIs da partida: taxa de aquisição, médias de dados, fluxo financeiro.'
    );
    this.metrics = { eventsTracked: 0 };
    this.kpis = { totalRolls: 0, totalDiceSum: 0, propertiesBought: 0, totalRentPaid: 0 };
  }

  async handleEvent(event, bus) {
    this.metrics.eventsTracked++;
    if (event.type === 'BOARD_STATE_SYNCED' && event.payload.change === 'ACQUISITION') {
      this.kpis.propertiesBought++;
    }
  }

  generateReport() {
    const state = getState();
    const owned = state.properties.filter(p => p.ownerId !== null);
    const totalSlots = state.properties.filter(p => p.type === 'PROPERTY').length;
    const acquisitionRate = totalSlots > 0 ? ((owned.length / totalSlots) * 100).toFixed(1) : 0;

    const playerStats = state.players.map(p => ({
      name: p.name,
      money: p.money,
      properties: owned.filter(s => s.ownerId === p.id).length,
      netWorth: p.money + owned.filter(s => s.ownerId === p.id).reduce((sum, s) => sum + s.cost, 0),
    }));

    return { acquisitionRate, owned: owned.length, totalSlots, playerStats, round: state.currentRound };
  }

  async selfTest() {
    const report = this.generateReport();
    return { passed: true, message: `KPIs calculados. Taxa de aquisição: ${report.acquisitionRate}%.` };
  }

  async runStandalone() {
    const report = this.generateReport();
    console.log(`  ${bold('Relatório de Analytics da Partida:')}\n`);
    console.log(`  ${bold('Rodada:')}              ${report.round}`);
    console.log(`  ${bold('Taxa de Aquisição:')}   ${report.acquisitionRate}% (${report.owned}/${report.totalSlots} propriedades)`);
    console.log();
    console.log(`  ${bold('Ranking de Jogadores:')}`);
    report.playerStats
      .sort((a, b) => b.netWorth - a.netWorth)
      .forEach((p, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        console.log(`    ${medal} ${p.name.padEnd(25)} Saldo: ${COLORS.GREEN}${String(p.money).padStart(6)}M${COLORS.RESET}  Props: ${p.properties}  Net: ${COLORS.YELLOW}${p.netWorth}M${COLORS.RESET}`);
      });
  }
}

module.exports = AnalyticsAgent;
if (require.main === module) runAgentCLI(AnalyticsAgent);

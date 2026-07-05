const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class BalancingAgent extends BaseAgent {
  constructor() {
    super(
      'balancing-agent',
      'Agente de Balanceamento',
      'INTELLIGENCE',
      'Monitora paridade financeira entre jogadores e injeta correções para manter o jogo equilibrado.'
    );
    this.metrics = { checksPerformed: 0, imbalancesDetected: 0, interventions: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'RULES_APPLIED') {
      this.metrics.checksPerformed++;
      const report = this.analyzeBalance();
      if (report.giniCoefficient > 0.4) {
        this.metrics.imbalancesDetected++;
      }
    }
  }

  analyzeBalance() {
    const state = getState();
    const alive = state.players.filter(p => !p.isBankrupt);
    if (alive.length < 2) return { giniCoefficient: 0, spread: 0, richest: null, poorest: null };

    const moneys = alive.map(p => p.money).sort((a, b) => a - b);
    const avg = moneys.reduce((s, v) => s + v, 0) / moneys.length;
    const spread = moneys[moneys.length - 1] - moneys[0];

    // Simplified Gini coefficient
    let sumDiffs = 0;
    for (let i = 0; i < moneys.length; i++) {
      for (let j = 0; j < moneys.length; j++) {
        sumDiffs += Math.abs(moneys[i] - moneys[j]);
      }
    }
    const gini = sumDiffs / (2 * moneys.length * moneys.length * avg) || 0;

    const richest = alive.reduce((r, p) => p.money > r.money ? p : r);
    const poorest = alive.reduce((r, p) => p.money < r.money ? p : r);

    return { giniCoefficient: gini, spread, avg, richest, poorest, playerCount: alive.length };
  }

  async selfTest() {
    const report = this.analyzeBalance();
    return { passed: true, message: `Coeficiente Gini: ${report.giniCoefficient.toFixed(3)}. Spread: ${report.spread}M.` };
  }

  async runStandalone() {
    const report = this.analyzeBalance();
    console.log(`  ${bold('Relatório de Balanceamento:')}\n`);
    console.log(`  ${bold('Jogadores ativos:')}    ${report.playerCount}`);
    console.log(`  ${bold('Média de saldo:')}      ${report.avg ? report.avg.toFixed(0) : 0}M`);
    console.log(`  ${bold('Spread (max-min):')}    ${report.spread}M`);

    const giniColor = report.giniCoefficient > 0.4 ? COLORS.RED : report.giniCoefficient > 0.2 ? COLORS.YELLOW : COLORS.GREEN;
    console.log(`  ${bold('Coeficiente Gini:')}    ${giniColor}${report.giniCoefficient.toFixed(3)}${COLORS.RESET}`);

    if (report.richest) console.log(`  ${bold('Mais rico:')}           ${report.richest.name} (${COLORS.GREEN}${report.richest.money}M${COLORS.RESET})`);
    if (report.poorest) console.log(`  ${bold('Mais pobre:')}          ${report.poorest.name} (${COLORS.RED}${report.poorest.money}M${COLORS.RESET})`);

    const verdict = report.giniCoefficient > 0.4
      ? `${COLORS.RED}⚠ DESBALANCEADO — intervenção recomendada${COLORS.RESET}`
      : `${COLORS.GREEN}✔ EQUILIBRADO${COLORS.RESET}`;
    console.log(`\n  ${bold('Veredicto:')} ${verdict}`);
  }
}

module.exports = BalancingAgent;
if (require.main === module) runAgentCLI(BalancingAgent);

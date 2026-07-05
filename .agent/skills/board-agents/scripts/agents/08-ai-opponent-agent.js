const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class AIOpponentAgent extends BaseAgent {
  constructor() {
    super(
      'ai-opponent-agent',
      'Agente de Oponentes IA',
      'INTELLIGENCE',
      'Gera decisões autônomas para bots baseado em personalidades (AGGRESSIVE, CONSERVATIVE, BALANCED).'
    );
    this.metrics = { decisions: 0, buys: 0, passes: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'RULES_APPLIED' && event.payload.canBuy && event.payload.player.isBot) {
      const state = getState();
      const { player } = event.payload;
      const slot = state.properties[player.position];

      const { decision, rationale } = this._decide(player, slot);
      this.metrics.decisions++;

      await bus.dispatch('AI_DECISION_MADE', { player, decision, slot, rationale });

      if (decision === 'BUY') {
        this.metrics.buys++;
        await bus.dispatch('INPUT_RECEIVED', { player, action: 'BUY_PROPERTY' });
      } else {
        this.metrics.passes++;
      }
    }
  }

  _decide(player, slot) {
    if (player.personality === 'AGGRESSIVE') {
      if (player.money >= slot.cost) {
        return { decision: 'BUY', rationale: 'Investimento agressivo! Dominação territorial.' };
      }
      return { decision: 'PASS', rationale: 'Sem capital para compra agressiva.' };
    }
    if (player.personality === 'CONSERVATIVE') {
      if (player.money - slot.cost >= 600) {
        return { decision: 'BUY', rationale: 'Compra segura. Reserva confortável.' };
      }
      return { decision: 'PASS', rationale: 'Risco alto para perfil conservador.' };
    }
    // BALANCED
    if (player.money - slot.cost >= 300) {
      return { decision: 'BUY', rationale: 'Relação custo-benefício aceitável.' };
    }
    return { decision: 'PASS', rationale: 'Melhor conservar capital neste momento.' };
  }

  async selfTest() {
    const cases = [
      { money: 1500, cost: 200, personality: 'AGGRESSIVE', expected: 'BUY' },
      { money: 300, cost: 400, personality: 'AGGRESSIVE', expected: 'PASS' },
      { money: 1500, cost: 800, personality: 'CONSERVATIVE', expected: 'BUY' },
      { money: 900, cost: 400, personality: 'CONSERVATIVE', expected: 'PASS' },
    ];
    let passed = true;
    for (const c of cases) {
      const { decision } = this._decide({ money: c.money, personality: c.personality }, { cost: c.cost });
      if (decision !== c.expected) { passed = false; break; }
    }
    return { passed, message: passed ? `${cases.length} cenários de decisão validados.` : 'Falha na lógica de decisão.' };
  }

  async runStandalone() {
    console.log(`  ${bold('Simulando decisões para cada personalidade:')}\n`);
    const scenarios = [
      { name: 'Bob (Agressivo)', money: 1200, personality: 'AGGRESSIVE' },
      { name: 'Clara (Conservadora)', money: 1200, personality: 'CONSERVATIVE' },
      { name: 'David (Balanceado)', money: 1200, personality: 'BALANCED' },
    ];
    const slot = { name: 'Centro Financeiro', cost: 220, rent: 45 };

    scenarios.forEach(s => {
      const { decision, rationale } = this._decide(s, slot);
      const icon = decision === 'BUY' ? `${COLORS.GREEN}✔ COMPRAR${COLORS.RESET}` : `${COLORS.RED}✖ PASSAR${COLORS.RESET}`;
      console.log(`  ${bold(s.name.padEnd(25))} ${icon}  ${COLORS.GRAY}${rationale}${COLORS.RESET}`);
    });

    console.log(`\n  ${COLORS.GRAY}Slot: ${slot.name} | Custo: ${slot.cost}M | Aluguel: ${slot.rent}M${COLORS.RESET}`);
  }
}

module.exports = AIOpponentAgent;
if (require.main === module) runAgentCLI(AIOpponentAgent);

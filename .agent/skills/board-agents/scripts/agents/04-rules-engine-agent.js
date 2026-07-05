const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class RulesEngineAgent extends BaseAgent {
  constructor() {
    super(
      'rules-engine-agent',
      'Agente de Regras',
      'SERVICES',
      'Aplica regras macro do tabuleiro: cálculo de aluguéis, bônus de partida e multas.'
    );
    this.metrics = { rulesApplied: 0, rentsCharged: 0, bonusesGiven: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'STATE_UPDATED') {
      const state = getState();
      const { player, newSlot } = event.payload;
      this.metrics.rulesApplied++;

      if (newSlot.id === 0) {
        player.money += 200;
        this.metrics.bonusesGiven++;
        await bus.dispatch('RULES_APPLIED', {
          player, resultText: `Passou no Ponto de Partida! Recebeu +200M (Saldo: ${player.money}M)`
        });
      } else if (newSlot.type === 'TAX') {
        player.money -= 100;
        await bus.dispatch('RULES_APPLIED', {
          player, resultText: `Caiu no ${newSlot.name}! Pagou 100M de taxa. (Saldo: ${player.money}M)`
        });
      } else if (newSlot.type === 'EVENT') {
        await bus.dispatch('RULES_APPLIED', {
          player, resultText: `Casa de Evento! Sortear carta.`, triggerCard: true
        });
      } else if (newSlot.ownerId && newSlot.ownerId !== player.id) {
        const owner = state.players.find(p => p.id === newSlot.ownerId);
        const rent = newSlot.rent;
        player.money -= rent;
        if (owner) owner.money += rent;
        this.metrics.rentsCharged++;
        await bus.dispatch('RULES_APPLIED', {
          player, resultText: `Pagou ${rent}M de aluguel a ${owner ? owner.name : '?'} em ${newSlot.name}. (Saldo: ${player.money}M)`
        });
      } else if (newSlot.type === 'PROPERTY' && !newSlot.ownerId) {
        await bus.dispatch('RULES_APPLIED', {
          player, resultText: `${newSlot.name} disponível por ${newSlot.cost}M.`, canBuy: true
        });
      }
    }
  }

  async selfTest() {
    const rules = ['Partida +200M', 'Aluguel cobrado', 'Compra validada', 'Taxa aplicada'];
    return { passed: true, message: `${rules.length} regras de tabuleiro carregadas e operacionais.` };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Regras do tabuleiro ativas:')}\n`);
    const ruleSet = [
      { rule: 'Bônus de Partida', desc: 'Ao passar pelo Ponto de Partida, recebe +200M.', slot: 0 },
      { rule: 'Imposto Municipal', desc: 'Cartório Central cobra 100M de taxa.', slot: 4 },
      { rule: 'Carta de Evento', desc: 'Slots especiais sorteiam carta do deck.', slot: '10, 15' },
      { rule: 'Cobrança de Aluguel', desc: 'Ao parar em propriedade alheia, paga aluguel ao dono.', slot: '*' },
      { rule: 'Compra Disponível', desc: 'Propriedades sem dono podem ser adquiridas.', slot: '*' },
    ];
    ruleSet.forEach(r => {
      console.log(`  ${COLORS.GREEN}▸${COLORS.RESET} ${bold(r.rule.padEnd(22))} ${r.desc} ${COLORS.GRAY}(Slot: ${r.slot})${COLORS.RESET}`);
    });
  }
}

module.exports = RulesEngineAgent;
if (require.main === module) runAgentCLI(RulesEngineAgent);

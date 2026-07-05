const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class PhysicsAgent extends BaseAgent {
  constructor() {
    super(
      'physics-agent',
      'Agente de Simulação',
      'SERVICES',
      'Simula efeitos probabilísticos: rolagem de dados, sorteio de cartas, eventos aleatórios.'
    );
    this.metrics = { rolls: 0, totalDice: 0, doubles: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'PHYSICS_SIMULATED') {
      const state = getState();
      const { player } = event.payload;
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const roll = die1 + die2;

      this.metrics.rolls++;
      this.metrics.totalDice += roll;
      if (die1 === die2) this.metrics.doubles++;

      const oldPosition = player.position;
      player.position = (oldPosition + roll) % 20;
      const newSlot = state.properties[player.position];

      await bus.dispatch('STATE_UPDATED', { player, die1, die2, roll, oldPosition, newSlot });
    }
  }

  async selfTest() {
    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1);
    }
    const avg = (results.reduce((a, b) => a + b, 0) / results.length).toFixed(2);
    const inRange = avg > 5 && avg < 9;
    return { passed: inRange, message: `100 rolagens simuladas. Média: ${avg} (esperado: ~7.0). ${inRange ? 'Distribuição OK.' : 'Distribuição anômala!'}` };
  }

  async runStandalone() {
    console.log(`  ${bold('Simulando 10 rolagens de dados:')}\n`);
    const dist = {};
    for (let i = 0; i < 10; i++) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      dist[total] = (dist[total] || 0) + 1;
      const doubles = d1 === d2 ? `${COLORS.YELLOW} DOUBLES!${COLORS.RESET}` : '';
      console.log(`  Rolagem ${String(i + 1).padStart(2)}: [${d1}] + [${d2}] = ${bold(String(total))}${doubles}`);
    }
    console.log(`\n  ${bold('Distribuição:')}`);
    Object.entries(dist).sort((a, b) => a[0] - b[0]).forEach(([k, v]) => {
      console.log(`    ${String(k).padStart(2)}: ${'█'.repeat(v * 3)} (${v}x)`);
    });
  }
}

module.exports = PhysicsAgent;
if (require.main === module) runAgentCLI(PhysicsAgent);

const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { bus } = require('../lib/event-bus');

class EventDispatcherAgent extends BaseAgent {
  constructor() {
    super(
      'event-dispatcher-agent',
      'Agente de Eventos',
      'SERVICES',
      'Barramento central de eventos: encaminha mensagens entre agentes via subscrições.'
    );
  }

  async handleEvent(event, _bus) {
    // The dispatcher itself doesn't handle events — it IS the bus.
  }

  async selfTest() {
    const subs = bus.getSubscriptions();
    const eventCount = Object.keys(subs).length;
    const agentCount = new Set(Object.values(subs).flat().map(a => a.id)).size;
    return {
      passed: true,
      message: `${eventCount} tipos de evento registrados, ${agentCount} agentes subscritos.`
    };
  }

  async runStandalone() {
    const subs = bus.getSubscriptions();
    const stats = bus.getStats();

    console.log(`  ${bold('Mapa de Subscrições do Barramento:')}\n`);

    if (Object.keys(subs).length === 0) {
      console.log(`  ${COLORS.GRAY}Nenhuma subscrição registrada. Execute via orquestrador para ver o mapa completo.${COLORS.RESET}`);
    } else {
      Object.entries(subs).forEach(([event, agents]) => {
        console.log(`  ${COLORS.GREEN}▸ ${event}${COLORS.RESET}`);
        agents.forEach(a => {
          console.log(`    ${COLORS.GRAY}└─ ${a.name} (${a.id})${COLORS.RESET}`);
        });
      });
    }

    console.log(`\n  ${bold('Estatísticas:')}`);
    console.log(`    Despachos totais: ${stats.totalDispatches}`);
    console.log(`    Tipos de evento:  ${stats.eventTypes}`);
    console.log(`    Subscrições:      ${stats.totalSubscriptions}`);
  }
}

module.exports = EventDispatcherAgent;
if (require.main === module) runAgentCLI(EventDispatcherAgent);

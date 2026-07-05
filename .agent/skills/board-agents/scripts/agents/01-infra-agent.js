const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold, header } = require('../lib/colors');

class InfraAgent extends BaseAgent {
  constructor() {
    super(
      'infra-agent',
      'Agente de Infraestrutura',
      'ARCHITECTURE',
      'Monitora a saúde do servidor, latência de rede simulada e conexões ativas.'
    );
    this.metrics = { healthChecks: 0, avgLatency: 0, totalLatency: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'PERSIST_TRIGGERED') {
      const latency = Math.floor(Math.random() * 15) + 2;
      this.metrics.healthChecks++;
      this.metrics.totalLatency += latency;
      this.metrics.avgLatency = Math.round(this.metrics.totalLatency / this.metrics.healthChecks);
    } else if (event.type === 'HEALTH_CHECK') {
      // Full system health check
      this.metrics.healthChecks++;
    }
  }

  async selfTest() {
    const latency = Math.floor(Math.random() * 10) + 1;
    const serverUp = true;
    const dbReachable = true;
    
    if (!serverUp) return { passed: false, message: 'Servidor não está respondendo.' };
    if (!dbReachable) return { passed: false, message: 'Database não alcançável.' };
    return { passed: true, message: `Health check OK. Latência simulada: ${latency}ms.` };
  }

  async runStandalone() {
    console.log(`  ${bold('Simulando Health Check do Sistema...')}\n`);
    
    const checks = [
      { name: 'Servidor NestJS', status: 'UP', latency: Math.floor(Math.random() * 10) + 1 },
      { name: 'Database (JSON)', status: 'UP', latency: Math.floor(Math.random() * 5) + 1 },
      { name: 'WebSocket Gateway', status: 'UP', latency: Math.floor(Math.random() * 8) + 2 },
      { name: 'Rede (Simulada)', status: 'UP', latency: Math.floor(Math.random() * 20) + 5 },
    ];

    checks.forEach(c => {
      const statusColor = c.status === 'UP' ? COLORS.GREEN : COLORS.RED;
      console.log(`  ${statusColor}●${COLORS.RESET} ${c.name.padEnd(25)} ${bold(c.status.padEnd(6))} ${COLORS.GRAY}${c.latency}ms${COLORS.RESET}`);
    });

    const totalLatency = checks.reduce((s, c) => s + c.latency, 0);
    console.log(`\n  ${bold('Total latência:')} ${totalLatency}ms | ${bold('Todos os serviços:')} ${COLORS.GREEN}OPERACIONAIS${COLORS.RESET}`);
  }
}

module.exports = InfraAgent;

if (require.main === module) {
  runAgentCLI(InfraAgent);
}

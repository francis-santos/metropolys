const { COLORS, LAYER_INFO, colorize, bold, header, subheader, divider, timestamp } = require('./colors');

/**
 * BaseAgent — Classe base para todos os 20 agentes do sistema Metropolys.
 * 
 * Cada agente que herda esta classe ganha:
 *  - Metadados (id, name, layer, description)
 *  - Rastreamento de invocações e erros
 *  - Status report padronizado
 *  - Self-test framework
 *  - CLI runner standalone (quando executado diretamente)
 */
class BaseAgent {
  constructor(id, name, layer, description) {
    this.id = id;
    this.name = name;
    this.layer = layer;
    this.description = description;
    this.invocations = 0;
    this.errors = [];
    this.lastActivity = null;
    this.status = 'IDLE'; // IDLE, ACTIVE, ERROR, DISABLED
    this.metrics = {};
  }

  logActivation(eventType) {
    this.invocations++;
    this.lastActivity = new Date().toISOString();
    this.status = 'ACTIVE';
  }

  logError(message, context = {}) {
    const err = { message, timestamp: new Date().toISOString(), context };
    this.errors.push(err);
    this.status = 'ERROR';
    return err;
  }

  clearErrors() {
    this.errors = [];
    if (this.status === 'ERROR') this.status = 'IDLE';
  }

  resetMetrics() {
    this.invocations = 0;
    this.errors = [];
    this.lastActivity = null;
    this.status = 'IDLE';
    this.metrics = {};
  }

  /** Override in subclasses to handle events */
  async handleEvent(event, bus) {}

  /** Override in subclasses to provide self-diagnostics */
  async selfTest() {
    return { passed: true, message: 'Nenhum auto-teste definido para este agente.' };
  }

  /** Override in subclasses to run a standalone demo */
  async runStandalone() {
    console.log(`${this.name}: Nenhuma demonstração standalone definida.`);
  }

  getStatus() {
    const layer = LAYER_INFO[this.layer];
    return {
      id: this.id,
      name: this.name,
      layer: this.layer,
      layerLabel: layer.label,
      status: this.status,
      invocations: this.invocations,
      errors: this.errors.length,
      lastActivity: this.lastActivity,
    };
  }

  printInfo() {
    const layer = LAYER_INFO[this.layer];
    console.log(header(`${layer.emoji} ${this.name}`));
    console.log(`  ${bold('ID:')}            ${this.id}`);
    console.log(`  ${bold('Camada:')}        ${layer.bg} ${layer.label} ${COLORS.RESET}`);
    console.log(`  ${bold('Descrição:')}     ${this.description}`);
    console.log(`  ${bold('Status:')}        ${this._statusColor(this.status)}`);
    console.log(`  ${bold('Invocações:')}    ${this.invocations}`);
    console.log(`  ${bold('Erros:')}         ${this.errors.length}`);
    console.log(`  ${bold('Última Ativ.:')} ${this.lastActivity || 'Nunca'}`);
    console.log();
  }

  printStatus() {
    const layer = LAYER_INFO[this.layer];
    const statusStr = this._statusColor(this.status);
    console.log(
      `  ${layer.color}●${COLORS.RESET} ` +
      `${bold(this.name.padEnd(28))} ` +
      `${statusStr.padEnd(20)} ` +
      `${COLORS.GRAY}Inv: ${String(this.invocations).padStart(4)} | Erros: ${String(this.errors.length).padStart(2)}${COLORS.RESET}`
    );
  }

  _statusColor(status) {
    switch (status) {
      case 'ACTIVE': return colorize('● ATIVO', COLORS.GREEN);
      case 'ERROR': return colorize('✖ ERRO', COLORS.RED);
      case 'DISABLED': return colorize('○ DESATIVADO', COLORS.GRAY);
      default: return colorize('◌ IDLE', COLORS.YELLOW);
    }
  }
}

/**
 * CLI Runner — Processa argumentos quando um agente é executado diretamente.
 * Chamado no bloco `if (require.main === module)` de cada agente.
 */
function runAgentCLI(AgentClass) {
  const agent = new AgentClass();
  const cmd = process.argv[2] || 'info';

  switch (cmd) {
    case 'info':
      agent.printInfo();
      break;
    case 'status':
      console.log(header(`Status: ${agent.name}`));
      agent.printStatus();
      console.log();
      break;
    case 'test':
      console.log(header(`Auto-Teste: ${agent.name}`));
      agent.selfTest().then(result => {
        if (result.passed) {
          console.log(`  ${colorize('✔ PASSOU', COLORS.GREEN)} ${result.message}`);
        } else {
          console.log(`  ${colorize('✖ FALHOU', COLORS.RED)} ${result.message}`);
        }
        console.log();
      });
      break;
    case 'run':
      console.log(header(`Execução Standalone: ${agent.name}`));
      agent.runStandalone().then(() => console.log());
      break;
    default:
      console.log(`${COLORS.RED}Comando desconhecido: '${cmd}'${COLORS.RESET}`);
      console.log(`Comandos: info, status, test, run`);
  }
}

module.exports = { BaseAgent, runAgentCLI };

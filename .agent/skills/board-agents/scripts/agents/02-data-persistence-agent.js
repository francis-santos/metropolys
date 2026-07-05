const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState, takeSnapshot, restoreSnapshot } = require('../lib/mock-state');

class DataPersistenceAgent extends BaseAgent {
  constructor() {
    super(
      'data-persistence-agent',
      'Agente de Persistência',
      'ARCHITECTURE',
      'Carrega e salva estados do jogo, registrando históricos e versionamento.'
    );
    this.metrics = { saves: 0, loads: 0, snapshots: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'BOARD_STATE_SYNCED') {
      this.metrics.saves++;
      await bus.dispatch('PERSIST_TRIGGERED', event.payload);
    }
  }

  async selfTest() {
    const snap = takeSnapshot();
    const restored = restoreSnapshot(snap);
    if (!restored) return { passed: false, message: 'Falha ao restaurar snapshot.' };
    return { passed: true, message: 'Snapshot criado e restaurado com sucesso.' };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Estado atual do banco de dados simulado:')}\n`);
    console.log(`  ${bold('Jogadores:')} ${state.players.length}`);
    state.players.forEach(p => {
      console.log(`    • ${p.name.padEnd(25)} Saldo: ${COLORS.GREEN}${p.money}M${COLORS.RESET}  Pos: ${p.position}`);
    });
    console.log(`\n  ${bold('Propriedades:')} ${state.properties.length} slots`);
    const owned = state.properties.filter(p => p.ownerId);
    console.log(`  ${bold('Com dono:')} ${owned.length}`);
    console.log(`  ${bold('Snapshots salvos:')} ${state.systemHealth.snapshots.length}`);

    console.log(`\n  ${bold('Criando snapshot...')}`);
    takeSnapshot();
    console.log(`  ${COLORS.GREEN}✔ Snapshot criado com sucesso.${COLORS.RESET}`);
  }
}

module.exports = DataPersistenceAgent;
if (require.main === module) runAgentCLI(DataPersistenceAgent);

const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold, header } = require('../lib/colors');
const { getState, getActivePlayer } = require('../lib/mock-state');
const readline = require('readline');

class InputAgent extends BaseAgent {
  constructor() {
    super(
      'input-agent',
      'Agente de Entrada',
      'INTERACTION',
      'Captura comandos do jogador (cliques, toque, teclado) e inicia a cadeia de eventos.'
    );
    this.metrics = { inputsCaptured: 0 };
  }

  async handleEvent(event, bus) {
    // Input agent is the ORIGIN — it doesn't handle events from the bus.
    // It CREATES events via dispatch.
  }

  async selfTest() {
    const validActions = ['ROLL_DICE', 'BUY_PROPERTY', 'DRAW_CARD'];
    return { passed: true, message: `${validActions.length} tipos de input mapeados: ${validActions.join(', ')}.` };
  }

  async runStandalone() {
    const player = getActivePlayer();
    console.log(`  ${bold('Mini-REPL de Entrada (Standalone)')}`);
    console.log(`  ${COLORS.GRAY}Jogador ativo: ${player.name}${COLORS.RESET}`);
    console.log(`  ${COLORS.GRAY}Comandos: roll, buy, card, exit${COLORS.RESET}\n`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const prompt = () => {
      rl.question(`  ${COLORS.CYAN}input>${COLORS.RESET} `, (input) => {
        const cmd = input.trim().toLowerCase();
        if (cmd === 'exit') { rl.close(); return; }
        const actionMap = { roll: 'ROLL_DICE', buy: 'BUY_PROPERTY', card: 'DRAW_CARD' };
        const action = actionMap[cmd];
        if (action) {
          this.metrics.inputsCaptured++;
          console.log(`  ${COLORS.GREEN}✔ Capturado:${COLORS.RESET} ${action} para ${player.name}`);
          console.log(`  ${COLORS.GRAY}(Em modo orquestrador, isso dispararia INPUT_RECEIVED no bus)${COLORS.RESET}\n`);
        } else {
          console.log(`  ${COLORS.RED}Comando desconhecido. Use: roll, buy, card, exit${COLORS.RESET}\n`);
        }
        prompt();
      });
    };
    prompt();
  }
}

module.exports = InputAgent;
if (require.main === module) runAgentCLI(InputAgent);

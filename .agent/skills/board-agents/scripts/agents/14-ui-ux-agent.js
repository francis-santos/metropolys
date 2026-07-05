const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');

class UIUXAgent extends BaseAgent {
  constructor() {
    super(
      'ui-ux-agent',
      'Agente de Interface',
      'INTERACTION',
      'Traduz ações do sistema em comandos visuais: animações, sons e feedback de UI.'
    );
    this.metrics = { renderCommands: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'STATE_UPDATED') {
      this.metrics.renderCommands++;
      // In real game: trigger Phaser animations, camera movement, sound effects
    }
  }

  async selfTest() {
    return { passed: true, message: 'Pipeline de renderização simulado OK.' };
  }

  async runStandalone() {
    console.log(`  ${bold('Comandos de UI/UX simulados:')}\n`);

    const commands = [
      { type: 'ANIMATION', target: 'player-pin', action: 'MOVE_TO_SLOT', params: 'slot=7, duration=800ms' },
      { type: 'SOUND', target: 'sfx-engine', action: 'PLAY', params: 'dice_roll.mp3' },
      { type: 'CAMERA', target: 'main-camera', action: 'PAN_TO', params: 'x=450, y=320, zoom=1.2' },
      { type: 'UI_OVERLAY', target: 'buy-dialog', action: 'SHOW', params: 'slot="Centro Financeiro", cost=220M' },
      { type: 'PARTICLE', target: 'confetti-emitter', action: 'BURST', params: 'count=50, color=#39ff14' },
      { type: 'NOTIFICATION', target: 'toast-system', action: 'DISPLAY', params: '"Sua vez de jogar!"' },
    ];

    commands.forEach(cmd => {
      const typeColor = cmd.type === 'ANIMATION' ? COLORS.CYAN
        : cmd.type === 'SOUND' ? COLORS.MAGENTA
        : cmd.type === 'CAMERA' ? COLORS.GREEN
        : cmd.type === 'PARTICLE' ? COLORS.YELLOW
        : COLORS.WHITE;
      console.log(
        `  ${typeColor}▸ ${cmd.type.padEnd(14)}${COLORS.RESET} ` +
        `${bold(cmd.action.padEnd(12))} ` +
        `${COLORS.GRAY}${cmd.target} → ${cmd.params}${COLORS.RESET}`
      );
    });
  }
}

module.exports = UIUXAgent;
if (require.main === module) runAgentCLI(UIUXAgent);

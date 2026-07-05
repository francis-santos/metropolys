const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');
const { getState } = require('../lib/mock-state');

class RuleValidatorAgent extends BaseAgent {
  constructor() {
    super(
      'rule-validator-agent',
      'Agente de Validação',
      'GAMEPLAY',
      'Valida se uma ação proposta viola regras contextuais imediatas (saldo, posse, turno).'
    );
    this.metrics = { validated: 0, rejected: 0 };
  }

  async handleEvent(event, bus) {
    if (event.type === 'INPUT_RECEIVED') {
      const { player, action } = event.payload;
      const result = this.validate(player, action);

      if (result.valid) {
        this.metrics.validated++;
        await bus.dispatch('ACTION_VALIDATED', { player, action });
      } else {
        this.metrics.rejected++;
        await bus.dispatch('NOTIFICATION_TRIGGERED', {
          text: `VALIDAÇÃO REJEITADA: ${player.name} → ${action}. Razão: ${result.reason}`
        });
      }
    }
  }

  validate(player, action) {
    const state = getState();

    if (action === 'BUY_PROPERTY') {
      const slot = state.properties[player.position];
      if (!slot || slot.type !== 'PROPERTY') return { valid: false, reason: 'Este slot não é uma propriedade comprável.' };
      if (slot.ownerId !== null) return { valid: false, reason: 'Propriedade já tem dono.' };
      if (player.money < slot.cost) return { valid: false, reason: `Saldo insuficiente (${player.money}M < ${slot.cost}M).` };
    }

    if (action === 'ROLL_DICE') {
      if (player.isBankrupt) return { valid: false, reason: 'Jogador falido não pode jogar.' };
    }

    return { valid: true, reason: '' };
  }

  async selfTest() {
    const state = getState();
    const player = { ...state.players[0], money: 50, position: 1 };
    const r1 = this.validate(player, 'BUY_PROPERTY');
    const r2 = this.validate({ ...player, money: 9999 }, 'BUY_PROPERTY');
    const r3 = this.validate({ ...player, isBankrupt: true }, 'ROLL_DICE');

    const allPassed = !r1.valid && r2.valid && !r3.valid;
    return { passed: allPassed, message: allPassed ? '3 cenários de validação verificados.' : 'Falha na lógica de validação.' };
  }

  async runStandalone() {
    const state = getState();
    console.log(`  ${bold('Testes de Validação de Ações:')}\n`);

    const cases = [
      { player: { ...state.players[0], money: 9999, position: 1 }, action: 'BUY_PROPERTY', desc: 'Compra com saldo suficiente' },
      { player: { ...state.players[0], money: 10, position: 1 }, action: 'BUY_PROPERTY', desc: 'Compra sem saldo' },
      { player: { ...state.players[0], position: 0 }, action: 'BUY_PROPERTY', desc: 'Comprar slot START' },
      { player: { ...state.players[0], isBankrupt: true }, action: 'ROLL_DICE', desc: 'Jogador falido tentando jogar' },
      { player: state.players[0], action: 'ROLL_DICE', desc: 'Rolagem válida' },
    ];

    cases.forEach(c => {
      const result = this.validate(c.player, c.action);
      const icon = result.valid ? `${COLORS.GREEN}✔ VÁLIDO${COLORS.RESET}` : `${COLORS.RED}✖ REJEITADO${COLORS.RESET}`;
      console.log(`  ${icon}  ${c.desc.padEnd(35)} ${COLORS.GRAY}${result.reason || 'OK'}${COLORS.RESET}`);
    });
  }
}

module.exports = RuleValidatorAgent;
if (require.main === module) runAgentCLI(RuleValidatorAgent);

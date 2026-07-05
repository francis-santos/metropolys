const { BaseAgent, runAgentCLI } = require('../lib/base-agent');
const { COLORS, bold } = require('../lib/colors');

class NotificationAgent extends BaseAgent {
  constructor() {
    super(
      'notification-agent',
      'Agente de Comunicação',
      'INTERACTION',
      'Formata e exibe mensagens legíveis sobre o andamento da partida no log global.'
    );
    this.metrics = { notifications: 0 };
    this.recentMessages = [];
  }

  async handleEvent(event, bus) {
    if (event.type === 'STATE_UPDATED') {
      const { player, roll, newSlot } = event.payload;
      const msg = `${player.name} rolou [${roll}] → ${newSlot.name}`;
      this._addMessage(msg);
      await bus.dispatch('NOTIFICATION_TRIGGERED', { text: msg });
    } else if (event.type === 'RULES_APPLIED' && event.payload.resultText) {
      this._addMessage(event.payload.resultText);
      await bus.dispatch('NOTIFICATION_TRIGGERED', { text: event.payload.resultText });
    }
  }

  _addMessage(text) {
    this.metrics.notifications++;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.recentMessages.push({ time, text });
    if (this.recentMessages.length > 50) this.recentMessages.shift();
  }

  async selfTest() {
    this._addMessage('Teste de notificação do auto-teste.');
    return { passed: true, message: `Pipeline de notificação OK. ${this.recentMessages.length} mensagens no buffer.` };
  }

  async runStandalone() {
    console.log(`  ${bold('Exemplos de Notificações Formatadas:')}\n`);

    const examples = [
      { type: 'MOVE', text: 'Alice rolou [8] → Parque Metropolitano' },
      { type: 'BUY', text: 'PROPRIEDADE ADQUIRIDA: Bob comprou Centro Financeiro por 220M.' },
      { type: 'RENT', text: 'Clara pagou 45M de aluguel a Bob em Centro Financeiro.' },
      { type: 'CARD', text: 'CARTA: Alice — "Boom de Turismo" (+200M. Saldo: 1700M)' },
      { type: 'VALIDATION', text: 'VALIDAÇÃO REJEITADA: Clara → BUY_PROPERTY. Saldo insuficiente.' },
      { type: 'SYSTEM', text: 'LOBBY INICIALIZADO: Pareando jogadores para Metropolys.' },
    ];

    examples.forEach(e => {
      const typeColor = e.type === 'MOVE' ? COLORS.CYAN
        : e.type === 'BUY' ? COLORS.GREEN
        : e.type === 'RENT' ? COLORS.YELLOW
        : e.type === 'CARD' ? COLORS.MAGENTA
        : e.type === 'VALIDATION' ? COLORS.RED
        : COLORS.BLUE;
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(`  ${COLORS.GRAY}${time}${COLORS.RESET} ${typeColor}[${e.type.padEnd(10)}]${COLORS.RESET} ${e.text}`);
    });
  }
}

module.exports = NotificationAgent;
if (require.main === module) runAgentCLI(NotificationAgent);

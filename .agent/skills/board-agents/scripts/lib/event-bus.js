const { COLORS, LAYER_INFO, bold, timestamp } = require('./colors');

/**
 * EventBus — Barramento central de eventos desacoplado.
 * Qualquer agente pode importar e usar o singleton.
 * Inclui TransactionTracer integrado para rastreamento de fluxos.
 */
class EventBus {
  constructor() {
    this.subscribers = {};
    this.tracer = new TransactionTracer();
    this.totalDispatches = 0;
    this.eventLog = []; // Last 100 events for analysis
  }

  subscribe(eventType, agent) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }
    // Prevent duplicates
    if (!this.subscribers[eventType].find(a => a.id === agent.id)) {
      this.subscribers[eventType].push(agent);
    }
  }

  unsubscribe(eventType, agentId) {
    if (this.subscribers[eventType]) {
      this.subscribers[eventType] = this.subscribers[eventType].filter(a => a.id !== agentId);
    }
  }

  async dispatch(eventType, payload = {}) {
    this.totalDispatches++;
    const agentsToNotify = this.subscribers[eventType] || [];

    // Log event
    this.eventLog.push({
      type: eventType,
      timestamp: new Date().toISOString(),
      subscriberCount: agentsToNotify.length,
      payloadKeys: Object.keys(payload),
    });
    if (this.eventLog.length > 100) this.eventLog.shift();

    for (const agent of agentsToNotify) {
      agent.logActivation(eventType);

      const detailSummary = this._formatDetail(eventType, payload);
      this.tracer.addStep(agent, eventType, detailSummary);

      try {
        await agent.handleEvent({ type: eventType, payload }, this);
      } catch (err) {
        agent.logError(`Exceção em handleEvent para ${eventType}: ${err.message}`, { eventType });
        console.log(`  ${COLORS.RED}[ERRO] ${agent.name} lançou exceção: ${err.message}${COLORS.RESET}`);
      }
    }
  }

  getSubscriptions() {
    const result = {};
    for (const [event, agents] of Object.entries(this.subscribers)) {
      result[event] = agents.map(a => ({ id: a.id, name: a.name }));
    }
    return result;
  }

  getStats() {
    return {
      totalDispatches: this.totalDispatches,
      eventTypes: Object.keys(this.subscribers).length,
      totalSubscriptions: Object.values(this.subscribers).reduce((sum, arr) => sum + arr.length, 0),
      recentEvents: this.eventLog.slice(-10),
    };
  }

  reset() {
    this.totalDispatches = 0;
    this.eventLog = [];
    this.tracer = new TransactionTracer();
  }

  _formatDetail(eventType, payload) {
    switch (eventType) {
      case 'INPUT_RECEIVED':
        return `Ação: ${payload.action || '?'}`;
      case 'PHYSICS_SIMULATED':
        return payload.player ? `Rolagem para ${payload.player.name}...` : '';
      case 'AI_DECISION_MADE':
        return `Decisão: ${payload.decision} (${payload.rationale || ''})`;
      case 'RULES_APPLIED':
        return `${payload.resultText || ''}`;
      case 'STATE_UPDATED':
        return payload.player && payload.newSlot
          ? `${payload.player.name} [${payload.die1}+${payload.die2}=${payload.roll}] → ${payload.newSlot.name}`
          : '';
      case 'BOARD_STATE_SYNCED':
        return payload.change || '';
      case 'PERSIST_TRIGGERED':
        return 'Gravando estado...';
      case 'NOTIFICATION_TRIGGERED':
        return payload.text ? `"${payload.text.substring(0, 60)}${payload.text.length > 60 ? '...' : ''}"` : '';
      case 'MATCH_START_REQUEST':
        return 'Iniciando pareamento...';
      case 'HEALTH_CHECK':
        return 'Health check solicitado';
      case 'CONSISTENCY_CHECK':
        return 'Verificação de consistência';
      default:
        return '';
    }
  }
}

/**
 * TransactionTracer — Rastreia a cadeia de ativação dos agentes em cada transação.
 */
class TransactionTracer {
  constructor() {
    this.currentTransactionId = null;
    this.currentTransactionName = null;
    this.steps = [];
    this.history = []; // Past transactions
    this.silent = false;
  }

  start(transactionName) {
    // Save previous transaction
    if (this.currentTransactionId && this.steps.length > 0) {
      this.history.push({
        id: this.currentTransactionId,
        name: this.currentTransactionName,
        steps: [...this.steps],
        startedAt: this._startTime,
      });
      if (this.history.length > 20) this.history.shift();
    }

    this.currentTransactionId = 'tx-' + Math.random().toString(36).substring(2, 7);
    this.currentTransactionName = transactionName;
    this.steps = [];
    this._startTime = new Date().toISOString();

    if (!this.silent) {
      console.log(`\n${COLORS.BOLD}${COLORS.WHITE}═══ TRANSAÇÃO [${transactionName.toUpperCase()}] (${this.currentTransactionId}) ═══${COLORS.RESET}\n`);
    }
  }

  addStep(agent, eventType, details = '') {
    const layer = LAYER_INFO[agent.layer];
    const stepNum = this.steps.length + 1;
    this.steps.push({ stepNum, agentId: agent.id, agentName: agent.name, layer: agent.layer, eventType, details, timestamp: new Date().toISOString() });

    if (!this.silent) {
      console.log(
        ` ${COLORS.BOLD}${COLORS.WHITE}[${String(stepNum).padStart(2)}]${COLORS.RESET} ` +
        `${layer.bg} ${agent.name.padEnd(25)} ${COLORS.RESET} ` +
        `${COLORS.BOLD}${layer.color}▸${COLORS.RESET} ${eventType.padEnd(24)} ` +
        `${COLORS.GRAY}${details}${COLORS.RESET}`
      );
    }
  }

  end() {
    if (!this.silent) {
      console.log(`\n${COLORS.BOLD}${COLORS.WHITE}═══ FIM [${this.steps.length} passos] ═══${COLORS.RESET}\n`);
    }
  }

  getSteps() {
    return [...this.steps];
  }
}

// Singleton instance
const bus = new EventBus();

module.exports = { EventBus, TransactionTracer, bus };

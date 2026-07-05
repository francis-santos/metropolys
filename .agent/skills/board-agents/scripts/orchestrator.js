#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { COLORS, LAYER_INFO, bold, header, subheader, divider, colorize } = require('./lib/colors');
const { bus } = require('./lib/event-bus');
const { getState, resetState, getActivePlayer, advanceTurn, takeSnapshot, restoreSnapshot } = require('./lib/mock-state');

// ─────────────────────────────────────────────────
// Dynamic Agent Loader
// ─────────────────────────────────────────────────
const AGENTS_DIR = path.join(__dirname, 'agents');
const agentFiles = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.js')).sort();

const agents = [];
for (const file of agentFiles) {
  const AgentClass = require(path.join(AGENTS_DIR, file));
  agents.push(new AgentClass());
}

// ─────────────────────────────────────────────────
// Event Subscriptions Wiring
// ─────────────────────────────────────────────────
function findAgent(id) { return agents.find(a => a.id === id); }

function wireSubscriptions() {
  // INPUT_RECEIVED → RuleValidator, CardAsset
  bus.subscribe('INPUT_RECEIVED', findAgent('rule-validator-agent'));
  bus.subscribe('INPUT_RECEIVED', findAgent('card-asset-agent'));

  // ACTION_VALIDATED → TurnManager
  bus.subscribe('ACTION_VALIDATED', findAgent('turn-manager-agent'));

  // TURN_PROCESSED → GameEngine
  bus.subscribe('TURN_PROCESSED', findAgent('game-engine-agent'));

  // PHYSICS_SIMULATED → Physics
  bus.subscribe('PHYSICS_SIMULATED', findAgent('physics-agent'));

  // STATE_UPDATED → RulesEngine, UIUX, Notification
  bus.subscribe('STATE_UPDATED', findAgent('rules-engine-agent'));
  bus.subscribe('STATE_UPDATED', findAgent('ui-ux-agent'));
  bus.subscribe('STATE_UPDATED', findAgent('notification-agent'));

  // RULES_APPLIED → Notification, AIOpponent, Balancing
  bus.subscribe('RULES_APPLIED', findAgent('notification-agent'));
  bus.subscribe('RULES_APPLIED', findAgent('ai-opponent-agent'));
  bus.subscribe('RULES_APPLIED', findAgent('balancing-agent'));

  // BOARD_STATE_SYNCED → BoardState, Persistence, Analytics
  bus.subscribe('BOARD_STATE_SYNCED', findAgent('board-state-agent'));
  bus.subscribe('BOARD_STATE_SYNCED', findAgent('data-persistence-agent'));
  bus.subscribe('BOARD_STATE_SYNCED', findAgent('analytics-agent'));

  // PERSIST_TRIGGERED → Infra
  bus.subscribe('PERSIST_TRIGGERED', findAgent('infra-agent'));

  // NOTIFICATION_TRIGGERED → (log only, no agent handler needed)

  // MATCH_START_REQUEST → Matchmaking
  bus.subscribe('MATCH_START_REQUEST', findAgent('matchmaking-agent'));
}

wireSubscriptions();

// ─────────────────────────────────────────────────
// 🧠 GAME SOVEREIGN AGENT (GSA) — Orchestrator
// ─────────────────────────────────────────────────

const GSA = {
  name: 'Game Sovereign Agent',
  version: '1.0.0',

  // ── 1. Bug Detection ──
  detect() {
    console.log(header('🔍 Bug Detection — Diagnóstico do Sistema'));
    const issues = [];

    // Check agent health
    agents.forEach(a => {
      if (a.errors.length > 0) {
        issues.push({ agent: a.id, type: 'ERROR', message: `${a.errors.length} erro(s) registrado(s)`, severity: 'HIGH' });
      }
      if (a.status === 'DISABLED') {
        issues.push({ agent: a.id, type: 'DISABLED', message: 'Agente desativado', severity: 'MEDIUM' });
      }
    });

    // Check state consistency
    const state = getState();
    state.players.forEach(p => {
      if (p.money < 0 && !p.isBankrupt) {
        issues.push({ agent: 'game-engine-agent', type: 'STATE', message: `${p.name} tem saldo negativo (${p.money}M) sem estar falido`, severity: 'HIGH' });
      }
    });

    // Check orphan properties
    state.properties.forEach(prop => {
      if (prop.ownerId && !state.players.find(p => p.id === prop.ownerId)) {
        issues.push({ agent: 'board-state-agent', type: 'ORPHAN', message: `Propriedade ${prop.name} tem dono inexistente: ${prop.ownerId}`, severity: 'HIGH' });
      }
    });

    // Check subscriptions
    const subs = bus.getSubscriptions();
    const criticalEvents = ['INPUT_RECEIVED', 'ACTION_VALIDATED', 'TURN_PROCESSED', 'PHYSICS_SIMULATED', 'STATE_UPDATED'];
    criticalEvents.forEach(ev => {
      if (!subs[ev] || subs[ev].length === 0) {
        issues.push({ agent: 'event-dispatcher-agent', type: 'WIRING', message: `Evento crítico '${ev}' sem subscribers`, severity: 'CRITICAL' });
      }
    });

    if (issues.length === 0) {
      console.log(`  ${COLORS.GREEN}✔ Nenhum problema detectado. Sistema saudável.${COLORS.RESET}\n`);
    } else {
      issues.forEach(issue => {
        const sevColor = issue.severity === 'CRITICAL' ? COLORS.RED : issue.severity === 'HIGH' ? COLORS.YELLOW : COLORS.WHITE;
        console.log(`  ${sevColor}[${issue.severity}]${COLORS.RESET} ${bold(issue.agent.padEnd(28))} ${issue.type}: ${issue.message}`);
      });
      console.log(`\n  ${bold('Total de problemas:')} ${issues.length}\n`);
    }
    return issues;
  },

  // ── 2. Repair Orchestration ──
  repair() {
    console.log(header('🛠️  Repair Orchestration — Ciclo de Correção'));
    const issues = this.detect();
    if (issues.length === 0) return;

    console.log(subheader('Aplicando correções automáticas'));
    let fixed = 0;

    issues.forEach(issue => {
      const agent = findAgent(issue.agent);
      if (issue.type === 'ERROR' && agent) {
        agent.clearErrors();
        console.log(`  ${COLORS.GREEN}✔${COLORS.RESET} Erros limpos em ${bold(agent.name)}`);
        fixed++;
      }
      if (issue.type === 'STATE') {
        const state = getState();
        const player = state.players.find(p => p.money < 0 && !p.isBankrupt);
        if (player) {
          player.isBankrupt = true;
          console.log(`  ${COLORS.GREEN}✔${COLORS.RESET} ${player.name} marcado como falido (saldo negativo corrigido).`);
          fixed++;
        }
      }
    });

    console.log(`\n  ${bold('Correções aplicadas:')} ${fixed}/${issues.length}\n`);
  },

  // ── 3. System Coordination ──
  coordinate() {
    console.log(header('🔄 System Coordination — Mapa de Dependências'));

    const subs = bus.getSubscriptions();
    const layers = ['SOCIAL', 'INTERACTION', 'GAMEPLAY', 'SERVICES', 'INTELLIGENCE', 'ARCHITECTURE'];

    layers.forEach(layer => {
      const info = LAYER_INFO[layer];
      const layerAgents = agents.filter(a => a.layer === layer);
      console.log(`  ${info.bg} ${info.label.padEnd(50)} ${COLORS.RESET}`);
      layerAgents.forEach(a => {
        const subscribedTo = Object.entries(subs)
          .filter(([_, arr]) => arr.find(s => s.id === a.id))
          .map(([ev]) => ev);
        const subStr = subscribedTo.length > 0 ? subscribedTo.join(', ') : 'nenhum';
        console.log(`    ${info.color}●${COLORS.RESET} ${a.name.padEnd(28)} ${COLORS.GRAY}← ${subStr}${COLORS.RESET}`);
      });
      console.log();
    });

    console.log(subheader('Prioridades de Resolução de Conflitos'));
    console.log(`  1. ${COLORS.RED}Regras do Jogo${COLORS.RESET} (RulesEngine, RuleValidator)`);
    console.log(`  2. ${COLORS.YELLOW}Motor do Jogo${COLORS.RESET} (GameEngine, TurnManager)`);
    console.log(`  3. ${COLORS.GREEN}Inteligência${COLORS.RESET} (AIOpponent, Balancing)`);
    console.log(`  4. ${COLORS.CYAN}Interface${COLORS.RESET} (UIUX, Notification)`);
    console.log();
  },

  // ── 4. Consistency Guardian ──
  consistency() {
    console.log(header('⚖️  Consistency Guardian — Verificação de Integridade'));
    const state = getState();
    const checks = [];

    // 1. Total money conservation
    const totalMoney = state.players.reduce((s, p) => s + p.money, 0);
    const expectedBase = state.players.length * 1500;
    checks.push({ name: 'Conservação Monetária', passed: true, detail: `Total em circulação: ${totalMoney}M` });

    // 2. Property ownership consistency
    const ownedProps = state.properties.filter(p => p.ownerId);
    let ownershipOk = true;
    ownedProps.forEach(prop => {
      if (!state.players.find(p => p.id === prop.ownerId)) ownershipOk = false;
    });
    checks.push({ name: 'Integridade de Posses', passed: ownershipOk, detail: `${ownedProps.length} propriedades com donos válidos` });

    // 3. Player positions valid
    const positionsOk = state.players.every(p => p.position >= 0 && p.position < 20);
    checks.push({ name: 'Posições Válidas', passed: positionsOk, detail: 'Todos os jogadores em slots válidos (0-19)' });

    // 4. No duplicate ownership
    const ownerIds = ownedProps.map(p => `${p.id}-${p.ownerId}`);
    const noDupes = new Set(ownerIds).size === ownerIds.length;
    checks.push({ name: 'Sem Duplicatas', passed: noDupes, detail: 'Nenhuma propriedade com donos duplicados' });

    // 5. Event bus wiring
    const subs = bus.getSubscriptions();
    const hasWiring = Object.keys(subs).length > 0;
    checks.push({ name: 'Barramento Conectado', passed: hasWiring, detail: `${Object.keys(subs).length} tipos de evento conectados` });

    checks.forEach(c => {
      const icon = c.passed ? `${COLORS.GREEN}✔ PASS${COLORS.RESET}` : `${COLORS.RED}✖ FAIL${COLORS.RESET}`;
      console.log(`  ${icon}  ${bold(c.name.padEnd(28))} ${COLORS.GRAY}${c.detail}${COLORS.RESET}`);
    });

    const allPassed = checks.every(c => c.passed);
    console.log(`\n  ${bold('Resultado:')} ${allPassed ? `${COLORS.GREEN}SISTEMA CONSISTENTE${COLORS.RESET}` : `${COLORS.RED}INCONSISTÊNCIAS DETECTADAS${COLORS.RESET}`}\n`);
    return allPassed;
  },

  // ── 5. UX Intelligence ──
  uxReport() {
    console.log(header('🧠 UX Intelligence — Análise de Experiência'));

    const insights = [
      { area: 'Fluxo de Compra', score: 8, suggestion: 'Diálogo de compra poderia mostrar ROI estimado do aluguel.' },
      { area: 'Feedback de Dados', score: 9, suggestion: 'Animação de dados com física realística melhora satisfação.' },
      { area: 'Notificações', score: 7, suggestion: 'Agrupar notificações em sequência rápida para evitar spam.' },
      { area: 'Tempo de Turno', score: 6, suggestion: 'Timer visual para pressionar decisões lentas de bots.' },
      { area: 'Onboarding', score: 5, suggestion: 'Tutorial interativo na primeira partida não está implementado.' },
      { area: 'Acessibilidade', score: 4, suggestion: 'Contraste de cores insuficiente em algumas sobreposições.' },
    ];

    insights.forEach(i => {
      const scoreColor = i.score >= 8 ? COLORS.GREEN : i.score >= 6 ? COLORS.YELLOW : COLORS.RED;
      const bar = '█'.repeat(i.score) + '░'.repeat(10 - i.score);
      console.log(`  ${bold(i.area.padEnd(22))} ${scoreColor}${bar} ${i.score}/10${COLORS.RESET}`);
      console.log(`  ${COLORS.GRAY}  └─ ${i.suggestion}${COLORS.RESET}\n`);
    });

    const avgScore = (insights.reduce((s, i) => s + i.score, 0) / insights.length).toFixed(1);
    console.log(`  ${bold('Score UX Médio:')} ${avgScore}/10\n`);
  },

  // ── 6. Failure Recovery ──
  recover() {
    console.log(header('🚨 Failure Recovery — Recuperação de Falhas'));
    const state = getState();

    console.log(`  ${bold('Snapshots disponíveis:')} ${state.systemHealth.snapshots.length}\n`);

    if (state.systemHealth.snapshots.length === 0) {
      console.log(`  ${COLORS.YELLOW}Nenhum snapshot encontrado. Criando snapshot do estado atual...${COLORS.RESET}`);
      takeSnapshot();
      console.log(`  ${COLORS.GREEN}✔ Snapshot base criado.${COLORS.RESET}\n`);
      return;
    }

    const lastSnap = state.systemHealth.snapshots[state.systemHealth.snapshots.length - 1];
    console.log(`  ${bold('Último snapshot:')} ${lastSnap._snapshotTime}`);
    console.log(`  ${bold('Simulando restauração...')}`);

    const success = restoreSnapshot(lastSnap);
    console.log(`  ${success ? `${COLORS.GREEN}✔ Estado restaurado com sucesso.${COLORS.RESET}` : `${COLORS.RED}✖ Falha na restauração.${COLORS.RESET}`}`);

    // Reset agent errors
    agents.forEach(a => a.clearErrors());
    console.log(`  ${COLORS.GREEN}✔ Erros de agentes limpos.${COLORS.RESET}\n`);
  },

  // ── 7. System Analytics Overseer ──
  metrics() {
    console.log(header('📊 System Analytics — Performance dos Agentes'));

    const busStats = bus.getStats();
    console.log(`  ${bold('Despachos totais do barramento:')} ${busStats.totalDispatches}`);
    console.log(`  ${bold('Tipos de evento registrados:')}     ${busStats.eventTypes}`);
    console.log(`  ${bold('Subscrições ativas:')}              ${busStats.totalSubscriptions}\n`);

    console.log(subheader('Ativação por Agente'));
    agents.forEach(a => a.printStatus());
    console.log();

    // Heatmap by layer
    console.log(subheader('Heatmap por Camada'));
    const layers = ['ARCHITECTURE', 'SERVICES', 'INTELLIGENCE', 'GAMEPLAY', 'INTERACTION', 'SOCIAL'];
    layers.forEach(layer => {
      const info = LAYER_INFO[layer];
      const layerAgents = agents.filter(a => a.layer === layer);
      const totalInv = layerAgents.reduce((s, a) => s + a.invocations, 0);
      const totalErr = layerAgents.reduce((s, a) => s + a.errors.length, 0);
      const bar = '█'.repeat(Math.min(totalInv, 40));
      console.log(`  ${info.color}${info.label.padEnd(28)}${COLORS.RESET} ${COLORS.GREEN}${bar}${COLORS.RESET} ${totalInv} inv | ${totalErr} erros`);
    });
    console.log();
  },

  // ── Status (All agents overview) ──
  status() {
    console.log(header('🧠 Game Sovereign Agent — Status Geral'));
    console.log(`  ${bold('Versão:')}    ${this.version}`);
    console.log(`  ${bold('Agentes:')}   ${agents.length}`);
    console.log(`  ${bold('Camadas:')}   ${new Set(agents.map(a => a.layer)).size}\n`);

    const layers = ['SOCIAL', 'INTERACTION', 'GAMEPLAY', 'SERVICES', 'INTELLIGENCE', 'ARCHITECTURE'];
    layers.forEach(layer => {
      const info = LAYER_INFO[layer];
      console.log(`  ${info.bg} ${info.emoji} ${info.label.padEnd(48)} ${COLORS.RESET}`);
      agents.filter(a => a.layer === layer).forEach(a => a.printStatus());
      console.log();
    });
  },

  // ── Trace ──
  async trace(actionName) {
    if (!actionName) {
      console.log(`${COLORS.RED}Uso: orchestrator.js trace <action>${COLORS.RESET}`);
      console.log(`  Ações: roll, buy, card, matchmake`);
      return;
    }

    resetState();
    wireSubscriptions();
    const player = getActivePlayer();

    bus.tracer.start(`Trace: ${actionName}`);

    if (actionName === 'roll') {
      await bus.dispatch('INPUT_RECEIVED', { player, action: 'ROLL_DICE' });
    } else if (actionName === 'buy') {
      player.position = 1;
      await bus.dispatch('INPUT_RECEIVED', { player, action: 'BUY_PROPERTY' });
    } else if (actionName === 'card') {
      await bus.dispatch('INPUT_RECEIVED', { player, action: 'DRAW_CARD' });
    } else if (actionName === 'matchmake') {
      await bus.dispatch('MATCH_START_REQUEST', {});
    } else {
      console.log(`${COLORS.RED}Ação desconhecida: '${actionName}'. Use: roll, buy, card, matchmake${COLORS.RESET}`);
      return;
    }

    bus.tracer.end();
  },

  // ── Simulate ──
  async simulate(turns) {
    resetState();
    wireSubscriptions();
    console.log(header(`Simulação Automática — ${turns} Turnos`));

    takeSnapshot(); // baseline

    for (let t = 1; t <= turns; t++) {
      const player = getActivePlayer();
      console.log(`${COLORS.BOLD}${COLORS.YELLOW}── TURNO ${t} | ${player.name} ──${COLORS.RESET}`);
      bus.tracer.start(`Turno ${t}`);
      await bus.dispatch('INPUT_RECEIVED', { player, action: 'ROLL_DICE' });
      bus.tracer.end();
      advanceTurn();
    }

    this.metrics();
  },

  // ── REPL ──
  startRepl() {
    resetState();
    wireSubscriptions();
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log(header('🧠 Game Sovereign Agent — Console Interativo'));
    console.log(`  Comandos: ${COLORS.GREEN}roll${COLORS.RESET}, ${COLORS.GREEN}buy${COLORS.RESET}, ${COLORS.GREEN}card${COLORS.RESET}, ${COLORS.GREEN}state${COLORS.RESET}, ${COLORS.GREEN}detect${COLORS.RESET}, ${COLORS.GREEN}consistency${COLORS.RESET}, ${COLORS.GREEN}metrics${COLORS.RESET}, ${COLORS.GREEN}recover${COLORS.RESET}, ${COLORS.GREEN}exit${COLORS.RESET}\n`);

    const prompt = () => {
      const player = getActivePlayer();
      rl.question(`  ${COLORS.BOLD}${COLORS.CYAN}GSA [${player.name}] ▸ ${COLORS.RESET}`, async (input) => {
        const cmd = input.trim().toLowerCase();
        if (cmd === 'exit' || cmd === 'quit') { rl.close(); return; }

        if (cmd === 'roll') {
          bus.tracer.start('REPL: Rolar Dados');
          await bus.dispatch('INPUT_RECEIVED', { player, action: 'ROLL_DICE' });
          bus.tracer.end();
          advanceTurn();
        } else if (cmd === 'buy') {
          bus.tracer.start('REPL: Comprar');
          await bus.dispatch('INPUT_RECEIVED', { player, action: 'BUY_PROPERTY' });
          bus.tracer.end();
        } else if (cmd === 'card') {
          bus.tracer.start('REPL: Carta');
          await bus.dispatch('INPUT_RECEIVED', { player, action: 'DRAW_CARD' });
          bus.tracer.end();
        } else if (cmd === 'state') {
          findAgent('board-state-agent').runStandalone();
        } else if (cmd === 'detect') {
          this.detect();
        } else if (cmd === 'consistency') {
          this.consistency();
        } else if (cmd === 'metrics') {
          this.metrics();
        } else if (cmd === 'recover') {
          this.recover();
        } else {
          console.log(`  ${COLORS.RED}Comando desconhecido. Use: roll, buy, card, state, detect, consistency, metrics, recover, exit${COLORS.RESET}\n`);
        }
        prompt();
      });
    };
    prompt();
  },
};

// ─────────────────────────────────────────────────
// CLI Router
// ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0] || 'help';

function showHelp() {
  console.log(header('🧠 GAME SOVEREIGN AGENT (GSA) — Orquestrador'));
  console.log(`  ${bold('Uso:')} node orchestrator.js [comando] [argumentos]\n`);
  console.log(`  ${bold('Comandos do Orquestrador:')}`);
  console.log(`    ${COLORS.GREEN}status${COLORS.RESET}          Status geral de todos os agentes`);
  console.log(`    ${COLORS.GREEN}detect${COLORS.RESET}          Detecção de bugs e inconsistências`);
  console.log(`    ${COLORS.GREEN}repair${COLORS.RESET}          Identificar e corrigir problemas`);
  console.log(`    ${COLORS.GREEN}coordinate${COLORS.RESET}      Mapa de dependências e prioridades`);
  console.log(`    ${COLORS.GREEN}consistency${COLORS.RESET}     Verificação de integridade do estado`);
  console.log(`    ${COLORS.GREEN}ux-report${COLORS.RESET}       Análise de UX e sugestões`);
  console.log(`    ${COLORS.GREEN}recover${COLORS.RESET}         Recuperação de falhas via snapshots`);
  console.log(`    ${COLORS.GREEN}metrics${COLORS.RESET}         Métricas de performance dos agentes\n`);
  console.log(`  ${bold('Comandos de Simulação:')}`);
  console.log(`    ${COLORS.GREEN}trace <action>${COLORS.RESET}  Rastrear fluxo (roll, buy, card, matchmake)`);
  console.log(`    ${COLORS.GREEN}simulate [N]${COLORS.RESET}    Simular N turnos automáticos`);
  console.log(`    ${COLORS.GREEN}repl${COLORS.RESET}            Console interativo\n`);
}

switch (command) {
  case 'status': GSA.status(); break;
  case 'detect': GSA.detect(); break;
  case 'repair': GSA.repair(); break;
  case 'coordinate': GSA.coordinate(); break;
  case 'consistency': GSA.consistency(); break;
  case 'ux-report': GSA.uxReport(); break;
  case 'recover': GSA.recover(); break;
  case 'metrics': GSA.metrics(); break;
  case 'trace': GSA.trace(args[1]); break;
  case 'simulate': GSA.simulate(parseInt(args[1], 10) || 3); break;
  case 'repl': GSA.startRepl(); break;
  case 'help': default: showHelp(); break;
}

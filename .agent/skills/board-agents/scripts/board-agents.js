#!/usr/bin/env node
/**
 * board-agents.js — Wrapper retrocompatível.
 * Delega todos os comandos para o orchestrator.js (Game Sovereign Agent).
 * 
 * Uso:
 *   node board-agents.js list          → orchestrator.js status
 *   node board-agents.js trace <ação>  → orchestrator.js trace <ação>
 *   node board-agents.js simulate [N]  → orchestrator.js simulate [N]
 *   node board-agents.js repl          → orchestrator.js repl
 */
const { execFileSync } = require('child_process');
const path = require('path');

const orchestratorPath = path.join(__dirname, 'orchestrator.js');
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Map legacy commands to orchestrator commands
const cmdMap = {
  'list': ['status'],
  'trace': ['trace', ...args.slice(1)],
  'simulate': ['simulate', ...args.slice(1)],
  'repl': ['repl'],
  'help': ['help'],
};

const orchestratorArgs = cmdMap[command] || args;

try {
  execFileSync('node', [orchestratorPath, ...orchestratorArgs], { stdio: 'inherit' });
} catch (e) {
  // execFileSync throws on non-zero exit, which is expected for interactive commands
}

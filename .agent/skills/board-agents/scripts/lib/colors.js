// ANSI Colors for console styling (Cyberpunk Metropolys theme)
const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  UNDERLINE: '\x1b[4m',
  CYAN: '\x1b[36m',
  MAGENTA: '\x1b[35m',
  YELLOW: '\x1b[33m',
  GREEN: '\x1b[32m',
  BLUE: '\x1b[34m',
  RED: '\x1b[31m',
  WHITE: '\x1b[37m',
  GRAY: '\x1b[90m',
  BG_CYAN: '\x1b[46m\x1b[30m',
  BG_MAGENTA: '\x1b[45m\x1b[30m',
  BG_YELLOW: '\x1b[43m\x1b[30m',
  BG_GREEN: '\x1b[42m\x1b[30m',
  BG_BLUE: '\x1b[44m\x1b[37m',
  BG_RED: '\x1b[41m\x1b[37m',
  BG_WHITE: '\x1b[47m\x1b[30m',
};

const LAYER_INFO = {
  ARCHITECTURE: { color: COLORS.BLUE, bg: COLORS.BG_BLUE, emoji: '🧠', label: 'ARQUITETURA (Fundação)', order: 1 },
  SERVICES:     { color: COLORS.GREEN, bg: COLORS.BG_GREEN, emoji: '⚙️', label: 'SERVIÇOS (Orquestração)', order: 2 },
  INTELLIGENCE: { color: COLORS.YELLOW, bg: COLORS.BG_YELLOW, emoji: '🤖', label: 'INTELIGÊNCIA (IA/Bal.)', order: 3 },
  GAMEPLAY:     { color: COLORS.MAGENTA, bg: COLORS.BG_MAGENTA, emoji: '🎮', label: 'GAMEPLAY (Recursos)', order: 4 },
  INTERACTION:  { color: COLORS.CYAN, bg: COLORS.BG_CYAN, emoji: '🧑', label: 'INTERAÇÃO (Jogador/UI)', order: 5 },
  SOCIAL:       { color: COLORS.RED, bg: COLORS.BG_RED, emoji: '👥', label: 'SOCIAL (Comunidade)', order: 6 },
};

function colorize(text, color) {
  return `${color}${text}${COLORS.RESET}`;
}

function bold(text) {
  return `${COLORS.BOLD}${text}${COLORS.RESET}`;
}

function header(text) {
  const line = '═'.repeat(64);
  return `\n${COLORS.BOLD}${COLORS.CYAN}╔${line}╗\n║  ${text.padEnd(62)}║\n╚${line}╝${COLORS.RESET}\n`;
}

function subheader(text) {
  return `${COLORS.BOLD}${COLORS.WHITE}── ${text} ${'─'.repeat(Math.max(0, 56 - text.length))}${COLORS.RESET}`;
}

function divider() {
  return `${COLORS.GRAY}${'─'.repeat(66)}${COLORS.RESET}`;
}

function timestamp() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
}

module.exports = { COLORS, LAYER_INFO, colorize, bold, header, subheader, divider, timestamp };

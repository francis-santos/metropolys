// Shared mock game state for simulations
// All agents import this to work with a consistent game world

function getSlotName(idx) {
  const names = [
    'Ponto de Partida', 'Bairro do Farol', 'Avenida Oceânica', 'Praça da Matriz',
    'Cartório Central', 'Distrito Industrial', 'Centro Financeiro', 'Parque Metropolitano',
    'Terminal Rodoviário', 'Zona Portuária', 'Alameda das Flores', 'Beco do Jazz',
    'Bairro Universitário', 'Avenida Central', 'Shopping Center', 'Orla Norte',
    'Mercado Municipal', 'Zona Residencial', 'Estação Ferroviária', 'Reserva Ecológica'
  ];
  return names[idx] || `Slot ${idx}`;
}

function createFreshState() {
  return {
    players: [
      { id: 'player-human', name: 'Alice (Humana)', position: 0, money: 1500, pin: 'pin-1', isBot: false, isBankrupt: false, propertiesOwned: [] },
      { id: 'player-bot-1', name: 'Bob (Agressivo)', position: 0, money: 1500, pin: 'pin-2', isBot: true, personality: 'AGGRESSIVE', isBankrupt: false, propertiesOwned: [] },
      { id: 'player-bot-2', name: 'Clara (Conservadora)', position: 0, money: 1500, pin: 'pin-3', isBot: true, personality: 'CONSERVATIVE', isBankrupt: false, propertiesOwned: [] },
    ],
    properties: Array.from({ length: 20 }, (_, idx) => ({
      id: idx,
      name: getSlotName(idx),
      type: idx === 0 ? 'START' : idx === 4 ? 'TAX' : idx === 10 ? 'EVENT' : idx === 15 ? 'EVENT' : 'PROPERTY',
      cost: idx === 0 || idx === 4 || idx === 10 || idx === 15 ? 0 : 100 + (idx * 20),
      rent: idx === 0 || idx === 4 || idx === 10 || idx === 15 ? 0 : 15 + (idx * 5),
      ownerId: null,
    })),
    currentRound: 1,
    activePlayerIndex: 0,
    logs: [],
    cards: [
      { text: 'Boom de Turismo: Ganhe +200 em dividendos imobiliários.', amount: 200 },
      { text: 'Reforma de Fachada Obrigatória: Pague 100 ao banco.', amount: -100 },
      { text: 'Taxa de Limpeza Urbana: Pague 50 por propriedade.', amount: -50, perProperty: true },
      { text: 'Leilão Judicial da Prefeitura: Ganhe +150.', amount: 150 },
      { text: 'Festival Gastronômico: Ganhe +120 em royalties.', amount: 120 },
      { text: 'Desastre ambiental: Pague 200 de multa.', amount: -200 },
    ],
    systemHealth: {
      uptime: Date.now(),
      errors: [],
      snapshots: [],
    },
  };
}

// Singleton mutable state — reset with resetState()
let STATE = createFreshState();

function getState() {
  return STATE;
}

function resetState() {
  STATE = createFreshState();
  return STATE;
}

function getActivePlayer() {
  return STATE.players[STATE.activePlayerIndex];
}

function advanceTurn() {
  const alivePlayers = STATE.players.filter(p => !p.isBankrupt);
  if (alivePlayers.length <= 1) return null;
  
  do {
    STATE.activePlayerIndex = (STATE.activePlayerIndex + 1) % STATE.players.length;
  } while (STATE.players[STATE.activePlayerIndex].isBankrupt);
  
  return STATE.players[STATE.activePlayerIndex];
}

function takeSnapshot() {
  const snap = JSON.parse(JSON.stringify(STATE));
  snap._snapshotTime = new Date().toISOString();
  STATE.systemHealth.snapshots.push(snap);
  // Keep only last 10 snapshots
  if (STATE.systemHealth.snapshots.length > 10) {
    STATE.systemHealth.snapshots.shift();
  }
  return snap;
}

function restoreSnapshot(snapshot) {
  if (!snapshot) return false;
  const snapshotTime = snapshot._snapshotTime;
  Object.assign(STATE, JSON.parse(JSON.stringify(snapshot)));
  delete STATE._snapshotTime;
  STATE.systemHealth.snapshots = STATE.systemHealth.snapshots || [];
  return true;
}

module.exports = { getState, resetState, getActivePlayer, advanceTurn, getSlotName, takeSnapshot, restoreSnapshot };

import { reactive } from 'vue';
import { boardSlots as defaultSlots } from './board-data';
import { supabase } from '../services/supabase';
import { cityPacks } from './citypacks';

// Helper for HTTP requests
const API_URL = 'http://localhost:3008';

const FALLBACK_EVENTS = [
  { text: "Parabéns! Suas ações imobiliárias subiram. Receba +150", amount: 150 },
  { text: "Manutenção de fachada obrigatória em suas propriedades. Pague 100", amount: -100 },
  { text: "Você ganhou o prêmio de melhor incorporador urbano. Receba +200", amount: 200 },
  { text: "Multa de trânsito perto da prefeitura. Pague 50", amount: -50 },
  { text: "Retorno sobre investimentos do trimestre. Receba +100", amount: 100 },
  { text: "Vazamento de água subterrâneo consertado. Pague 120", amount: -120 },
];

export const gameStore = reactive({
  // State
  players: [],
  activeTurnIndex: 0,
  isAnimating: false,
  boardSlots: JSON.parse(JSON.stringify(defaultSlots)),
  logs: [],
  startingCapital: 1500,
  gamePhase: 'SETUP', // 'SETUP', 'LOBBY', 'PLAYING', 'FINISHED'
  winner: null,
  selectedPin: localStorage.getItem('metropolys_selected_pin') || null,
  transparentPins: {},

  // Selected action overlay state
  landedSlot: null,
  canBuyCurrentProperty: false,
  showBuyDialog: false,
  diceResult: null,
  die1: null,
  die2: null,
  displayedDiceResult: null,
  displayedDie1: null,
  displayedDie2: null,
  currentEventCard: null,

  // Multiplayer variables
  roomCode: null,
  roomId: null,
  myPlayerId: null,
  isMultiplayer: false,
  realtimeChannel: null,

  // Economy Cycles (MVP3)
  economicCycle: 'EXPANSION',
  interestRate: 0.05,
  bankingLiquidity: 10000,
  activeEventName: null,
  activeEventModifier: 1.0,

  // Auctions (MVP3)
  activeAuction: null,
  showAuctionDialog: false,

  // Trades (MVP3)
  activeTrade: null,
  showTradeDialog: false,
  incomingTradeProposal: null,
  showIncomingTradeDialog: false,

  // AI Integration (MVP5)
  isBotThinking: false,
  botThinkingPlayerId: null,
  aiNewsFeed: [],

  // Getters
  getActivePlayer() {
    return this.players[this.activeTurnIndex] || null;
  },

  getAlivePlayers() {
    return this.players.filter(p => !p.isBankrupt);
  },

  isMyTurn() {
    if (!this.isMultiplayer) return true;
    const active = this.getActivePlayer();
    return active && active.id === this.myPlayerId;
  },

  // Actions
  initializeCity(cityCode) {
    const code = cityCode || 'salvador';
    const config = cityPacks[code] || cityPacks['salvador'];
    this.activeCityConfig = config;
    this.startingCapital = config.startingCapital;
    this.economicCycle = 'EXPANSION';
    this.interestRate = 0.05;
    this.activeEventModifier = 1.0;
    this.activeEventName = null;

    // Merge city pack slots with coordinates from defaultSlots (board-data)
    this.boardSlots = config.slots.map(slot => {
      const defaultSlot = defaultSlots.find(s => s.id === slot.id);
      return {
        ...slot,
        x: defaultSlot ? defaultSlot.x : 0,
        y: defaultSlot ? defaultSlot.y : 0
      };
    });
  },

  initializeGame(configuredPlayers) {
    // Local Game Setup
    this.isMultiplayer = false;
    this.roomCode = null;
    this.roomId = null;
    this.myPlayerId = null;
    
    const chosenPins = new Set();
    configuredPlayers.forEach(p => {
      if (p.pin && p.pin !== 'random') chosenPins.add(p.pin);
    });

    this.players = configuredPlayers.map((p, idx) => {
      let pinVal = p.pin;
      if (!pinVal || pinVal === 'random') {
        const available = [1, 2, 3, 4, 5, 6, 7, 8]
          .map(n => `pin-${n}`)
          .filter(pin => !chosenPins.has(pin));
        
        const sourceList = available.length > 0 ? available : [1, 2, 3, 4, 5, 6, 7, 8].map(n => `pin-${n}`);
        pinVal = sourceList[Math.floor(Math.random() * sourceList.length)];
        chosenPins.add(pinVal);
      }

      return {
        id: `local-player-${idx}`,
        name: p.name || `Jogador ${idx + 1}`,
        color: p.color || '#6366F1',
        pin: pinVal,
        money: Number(this.startingCapital),
        position: 0,
        isBankrupt: false,
        isHost: idx === 0,
        isBot: p.isBot || false,
        botPersonality: p.botPersonality || null,
        propertiesOwned: []
      };
    });

    if (!this.activeCityConfig) {
      this.boardSlots = JSON.parse(JSON.stringify(defaultSlots));
    }
    this.boardSlots.forEach(slot => {
      if (slot.type === 'PROPERTY') slot.ownerId = null;
    });

    this.activeTurnIndex = 0;
    this.isAnimating = false;
    this.logs = [];
    this.addLog("O jogo começou localmente (Hotseat).");
    this.gamePhase = 'PLAYING';
    this.winner = null;
    this.landedSlot = null;
    this.canBuyCurrentProperty = false;
    this.showBuyDialog = false;
    this.diceResult = null;
    this.currentEventCard = null;
  },

  addLog(message, color = null) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logs.unshift({ time, text: message, color });
  },

  // --- MULTIPLAYER API CALLS (MVP 2) ---

  async createOnlineRoom(hostName, color, cityCode, pin) {
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityCode, hostName, hostColor: color, hostPin: pin }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      const room = await res.json();
      
      this.roomCode = room.code;
      this.roomId = room.id;
      this.isMultiplayer = true;
      this.gamePhase = 'LOBBY';
      this.initializeCity(cityCode);

      // Fetch host details from database
      const playersRes = await fetch(`${API_URL}/api/db/players?room_id=${room.id}`);
      const players = await playersRes.json();
      const host = players.find(p => p.isHost);
      this.myPlayerId = host.id;

      // Save to localStorage for reconnection support
      localStorage.setItem('metropolys_room_code', room.code);
      localStorage.setItem('metropolys_player_id', host.id);

      this.subscribeToRoomRealtime(room.id);
      this.refreshFullState();
      
      return room.code;
    } catch (e) {
      console.error(e);
      alert("Erro ao criar sala online.");
    }
  },

  async joinOnlineRoom(code, name, color, pin) {
    try {
      const res = await fetch(`${API_URL}/api/rooms/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, pin }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to join room");
      }
      const player = await res.json();
      
      this.roomCode = code;
      this.roomId = player.roomId;
      this.isMultiplayer = true;
      this.myPlayerId = player.id;
      this.gamePhase = 'LOBBY';

      // Save to localStorage for reconnection support
      localStorage.setItem('metropolys_room_code', code);
      localStorage.setItem('metropolys_player_id', player.id);

      this.subscribeToRoomRealtime(player.roomId);
      this.refreshFullState();
      
      return true;
    } catch (e) {
      console.error(e);
      alert(e.message || "Erro ao entrar na sala online.");
      return false;
    }
  },

  async startOnlineMatch() {
    if (!this.roomCode) return;
    try {
      await fetch(`${API_URL}/api/rooms/${this.roomCode}/start`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  },

  async reconnectRoom(code, playerId) {
    try {
      const res = await fetch(`${API_URL}/api/db/rooms?code=${code}`);
      const rooms = await res.json();
      if (rooms.length === 0) return false;
      const room = rooms[0];

      const playersRes = await fetch(`${API_URL}/api/db/players?room_id=${room.id}`);
      const players = await playersRes.json();
      const me = players.find(p => p.id === playerId);
      if (!me) return false;

      this.roomCode = code;
      this.roomId = room.id;
      this.isMultiplayer = true;
      this.myPlayerId = playerId;
      this.gamePhase = room.status;
      this.initializeCity(room.cityCode);

      this.subscribeToRoomRealtime(room.id);
      await this.refreshFullState();
      
      this.addLog(`Reconectado com sucesso ao jogador ${me.name}!`, me.color);
      return true;
    } catch (e) {
      console.log('Reconnection failed:', e);
      return false;
    }
  },

  subscribeToRoomRealtime(roomId) {
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
    }

    console.log(`Subscribing to Realtime channel for room: ${roomId}`);
    this.realtimeChannel = supabase.channel(`room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `room_id=eq.${roomId}` }, (payload) => {
        const room = payload.new;
        this.gamePhase = room.status;
        this.economicCycle = room.economicCycle;
        this.interestRate = room.interestRate;
        this.bankingLiquidity = room.bankingLiquidity;
        this.activeEventName = room.activeEventName;
        this.activeEventModifier = room.activeEventModifier;
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, (payload) => {
        this.refreshPlayers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties', filter: `room_id=eq.${roomId}` }, (payload) => {
        this.refreshProperties();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const log = payload.new;
          const time = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          this.logs.unshift({ time, text: log.text, color: log.color });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions', filter: `room_id=eq.${roomId}` }, (payload) => {
        const auction = payload.new;
        if (payload.eventType === 'DELETE' || auction.status === 'FINISHED') {
          this.activeAuction = null;
          this.showAuctionDialog = false;
        } else {
          this.activeAuction = auction;
          this.showAuctionDialog = true;
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades', filter: `room_id=eq.${roomId}` }, (payload) => {
        const trade = payload.new;
        if (payload.eventType === 'INSERT') {
          if (trade.receiverId === this.myPlayerId && trade.status === 'PENDING') {
            this.incomingTradeProposal = trade;
            this.showIncomingTradeDialog = true;
          }
        } else if (payload.eventType === 'UPDATE') {
          if (trade.status !== 'PENDING') {
            if (this.incomingTradeProposal?.id === trade.id) {
              this.incomingTradeProposal = null;
              this.showIncomingTradeDialog = false;
            }
            if (this.activeTrade?.id === trade.id) {
              this.activeTrade = null;
              this.showTradeDialog = false;
            }
          }
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_news', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          this.aiNewsFeed.unshift(payload.new);
        }
      })
      .subscribe();
  },

  async refreshRoom() {
    if (!this.roomCode) return;
    try {
      const res = await fetch(`${API_URL}/api/db/rooms?code=${this.roomCode}`);
      const rooms = await res.json();
      if (rooms && rooms.length > 0) {
        const room = rooms[0];
        this.initializeCity(room.cityCode);
        this.gamePhase = room.status;
        this.economicCycle = room.economicCycle;
        this.interestRate = room.interestRate;
        this.bankingLiquidity = room.bankingLiquidity;
        this.activeEventName = room.activeEventName;
        this.activeEventModifier = room.activeEventModifier;
      }
    } catch (e) {
      console.error("Failed to refresh room:", e);
    }
  },

  async refreshFullState() {
    if (!this.roomId) return;
    await this.refreshRoom();
    await this.refreshPlayers();
    await this.refreshProperties();
    await this.refreshLogs();
    await this.refreshAiNews();
  },

  async refreshPlayers() {
    const res = await fetch(`${API_URL}/api/db/players?room_id=${this.roomId}`);
    const players = await res.json();
    this.players = players;
    
    // Auto-update turn index based on who matches active index
    // Handled in backend, frontend queries turn updates
    window.dispatchEvent(new CustomEvent('phaser-sync-board'));
  },

  async refreshProperties() {
    const res = await fetch(`${API_URL}/api/db/properties?room_id=${this.roomId}`);
    const props = await res.json();
    props.forEach(p => {
      const slot = this.boardSlots.find(s => s.id === p.slotId);
      if (slot) {
        slot.ownerId = p.ownerId;
        slot.cost = p.baseCost;
        slot.rent = p.currentRent;
      }
    });

    // Sync properties badges
    this.players.forEach(player => {
      player.propertiesOwned = props.filter(p => p.ownerId === player.id).map(p => p.slotId);
    });

    window.dispatchEvent(new CustomEvent('phaser-sync-board'));
  },

  async refreshLogs() {
    const res = await fetch(`${API_URL}/api/db/logs?room_id=${this.roomId}`);
    const dbLogs = await res.json();
    this.logs = dbLogs.map(log => ({
      time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: log.text,
      color: log.color,
    }));
  },

  async refreshAiNews() {
    try {
      const res = await fetch(`${API_URL}/api/db/ai_news?room_id=${this.roomId}`);
      const news = await res.json();
      this.aiNewsFeed = news.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      console.error('Failed to refresh AI news:', e);
    }
  },

  // --- GAMEPLAY TRIGGERS (ROLL, BUY, END TURN) ---

  async rollDice() {
    if (this.isAnimating) return null;

    if (this.isMultiplayer) {
      if (!this.isMyTurn()) return null;
      try {
        const res = await fetch(`${API_URL}/api/rooms/${this.roomCode}/roll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.myPlayerId }),
        });
        if (!res.ok) throw new Error("Roll failed");
        const details = await res.json();
        
        this.diceResult = details.roll;
        this.die1 = details.die1;
        this.die2 = details.die2;
        this.displayedDiceResult = null;
        this.displayedDie1 = null;
        this.displayedDie2 = null;
        this.isAnimating = true;
        this.showBuyDialog = false;
        
        return details; // { playerId, roll, die1, die2, from, to }
      } catch (e) {
        console.error(e);
        return null;
      }
    } else {
      // Local Game Loop
      const p = this.getActivePlayer();
      if (!p || p.isBankrupt) return null;

      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const roll = die1 + die2;
      this.diceResult = roll;
      this.die1 = die1;
      this.die2 = die2;
      this.displayedDiceResult = null;
      this.displayedDie1 = null;
      this.displayedDie2 = null;
      this.isAnimating = true;
      this.currentEventCard = null;
      this.showBuyDialog = false;

      this.addLog(`${p.name} lançou os dados e tirou: ${roll} (${die1} + ${die2})`, p.color);

      const oldPosition = p.position;
      const newPosition = (oldPosition + roll) % this.boardSlots.length;

      if (newPosition < oldPosition && newPosition !== 0) {
        p.money += 200;
        this.addLog(`${p.name} passou pela Partida e recebeu +200 de bônus!`, '#10B981');
      }

      return { playerId: p.id, roll, die1, die2, from: oldPosition, to: newPosition };
    }
  },

  async onMovementComplete(toPosition) {
    if (this.isMultiplayer) {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${this.roomCode}/resolve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.myPlayerId, slotId: toPosition }),
        });
        const resolution = await res.json();
        
        this.isAnimating = false;
        const slot = this.boardSlots[toPosition];

        if (resolution.type === 'PROPERTY') {
          if (resolution.status === 'UNOWNED') {
            this.landedSlot = slot;
            const me = this.players.find(p => p.id === this.myPlayerId);
            this.canBuyCurrentProperty = me.money >= slot.cost;
            this.showBuyDialog = true;
          }
        } else if (resolution.type === 'EVENT') {
          this.currentEventCard = resolution.card;
        }
      } catch (e) {
        console.error(e);
        this.isAnimating = false;
      }
    } else {
      // Local Game resolve landing
      const p = this.getActivePlayer();
      if (!p) return;

      p.position = toPosition;
      const slot = this.boardSlots[toPosition];
      this.addLog(`${p.name} parou em: ${slot.name}`);

      if (slot.type === 'START') {
        p.money += 200;
        this.addLog(`${p.name} parou exatamente no START e recebeu +200!`, '#10B981');
        this.isAnimating = false;
      } 
      else if (slot.type === 'PROPERTY') {
        this.resolvePropertySlot(p, slot);
      } 
      else if (slot.type === 'TAX') {
        this.resolveTaxSlot(p, slot);
      } 
      else if (slot.type === 'EVENT') {
        this.resolveEventSlot(p, slot);
      }
    }
  },

  resolvePropertySlot(player, slot) {
    if (slot.ownerId === null) {
      this.landedSlot = slot;
      this.canBuyCurrentProperty = player.money >= slot.cost;
      this.showBuyDialog = true;
    } else if (slot.ownerId === player.id) {
      this.addLog(`${player.name} visitou sua própria propriedade.`);
      this.isAnimating = false;
    } else {
      const owner = this.players.find(p => p.id === slot.ownerId);
      if (owner.isBankrupt) {
        this.addLog(`Esta propriedade pertence ao falido ${owner.name}. Sem aluguel cobrado.`);
        this.isAnimating = false;
      } else {
        const rentAmount = Math.floor(slot.rent * this.activeEventModifier);
        this.addLog(`${player.name} deve pagar aluguel de ${rentAmount} para ${owner.name}.`, '#EF4444');
        this.transactMoney(player, owner, rentAmount);
        this.isAnimating = false;
      }
    }
  },

  resolveTaxSlot(player, slot) {
    this.addLog(`${player.name} foi taxado em ${slot.cost} pelo ${slot.name}.`, '#EF4444');
    this.deductMoney(player, slot.cost);
    this.isAnimating = false;
  },

  resolveEventSlot(player, slot) {
    const card = FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)];
    this.currentEventCard = card;
    this.addLog(`Sorte ou Revés: ${card.text}`, card.amount > 0 ? '#10B981' : '#EF4444');
    
    if (card.amount > 0) {
      player.money += card.amount;
    } else {
      this.deductMoney(player, Math.abs(card.amount));
    }
    this.isAnimating = false;
  },

  async buyProperty() {
    if (this.isMultiplayer) {
      const slot = this.landedSlot;
      if (!slot) return;
      try {
        await fetch(`${API_URL}/api/rooms/${this.roomCode}/buy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.myPlayerId, slotId: slot.id }),
        });
        this.closeBuyDialog();
      } catch (e) {
        console.error(e);
      }
    } else {
      const p = this.getActivePlayer();
      const slot = this.landedSlot;
      if (!p || !slot || slot.ownerId !== null) return;

      if (p.money >= slot.cost) {
        p.money -= slot.cost;
        slot.ownerId = p.id;
        p.propertiesOwned.push(slot.id);
        this.addLog(`${p.name} comprou ${slot.name} por ${slot.cost}!`, p.color);
        this.closeBuyDialog();
        window.dispatchEvent(new CustomEvent('phaser-sync-board'));
      } else {
        this.addLog(`Saldo insuficiente para comprar ${slot.name}.`);
      }
    }
  },

  async takeBankLoan(amount) {
    if (this.isMultiplayer) {
      try {
        const res = await fetch(`${API_URL}/api/rooms/${this.roomCode}/loan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.myPlayerId, amount }),
        });
        const data = await res.json();
        this.refreshPlayers();
        return data;
      } catch (e) {
        console.error(e);
      }
    } else {
      const p = this.getActivePlayer();
      if (!p || this.bankingLiquidity < amount) return;
      p.money += amount;
      this.bankingLiquidity -= amount;
      this.addLog(`${p.name} realizou empréstimo bancário de ${amount}M.`, '#F59E0B');
    }
  },

  closeBuyDialog() {
    this.showBuyDialog = false;
    this.landedSlot = null;
    this.canBuyCurrentProperty = false;
    this.isAnimating = false;
  },

  async endTurn() {
    if (this.isMultiplayer) {
      if (!this.isMyTurn()) return;
      try {
        await fetch(`${API_URL}/api/rooms/${this.roomCode}/end-turn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: this.myPlayerId }),
        });
        this.diceResult = null;
        this.displayedDiceResult = null;
        this.displayedDie1 = null;
        this.displayedDie2 = null;
      } catch (e) {
        console.error(e);
      }
    } else {
      // Local Game Loop
      if (this.isAnimating || this.showBuyDialog || this.gamePhase !== 'PLAYING') return;

      let nextIndex = this.activeTurnIndex;
      const totalPlayers = this.players.length;

      for (let i = 0; i < totalPlayers; i++) {
        nextIndex = (nextIndex + 1) % totalPlayers;
        if (!this.players[nextIndex].isBankrupt) {
          this.activeTurnIndex = nextIndex;
          const nextPlayer = this.players[nextIndex];
          this.addLog(`É o turno de ${nextPlayer.name}!`, nextPlayer.color);
          this.diceResult = null;
          this.displayedDiceResult = null;
          this.displayedDie1 = null;
          this.displayedDie2 = null;
          return;
        }
      }
    }
  },

  // --- LOCAL TRANSFERS ---

  transactMoney(fromPlayer, toPlayer, amount) {
    if (fromPlayer.money >= amount) {
      fromPlayer.money -= amount;
      toPlayer.money += amount;
      this.addLog(`${fromPlayer.name} transferiu ${amount} para ${toPlayer.name}.`);
    } else {
      const partial = fromPlayer.money;
      fromPlayer.money = 0;
      toPlayer.money += partial;
      this.addLog(`${fromPlayer.name} transferiu apenas ${partial} (tudo o que tinha) para ${toPlayer.name}.`);
      this.deductMoney(fromPlayer, amount - partial);
    }
  },

  deductMoney(player, amount) {
    player.money -= amount;
    if (player.money < 0) {
      this.addLog(`${player.name} está inadimplente com saldo negativo: ${player.money}.`, '#EF4444');
      this.checkBankruptcy(player);
    }
  },

  checkBankruptcy(player) {
    if (player.money < 0) {
      this.triggerBankruptcy(player);
    }
  },

  triggerBankruptcy(player) {
    player.isBankrupt = true;
    this.addLog(`🚨 ${player.name} DECLAROU FALÊNCIA!`, '#EF4444');

    this.boardSlots.forEach(slot => {
      if (slot.ownerId === player.id) {
        slot.ownerId = null;
        this.addLog(`Propriedade ${slot.name} retornou ao mercado.`);
      }
    });

    player.propertiesOwned = [];

    // Dispatch event to sync Phaser board visuals immediately!
    window.dispatchEvent(new CustomEvent('phaser-sync-board'));

    const alive = this.getAlivePlayers();
    if (alive.length <= 1) {
      this.gamePhase = 'FINISHED';
      this.winner = alive[0] || null;
      if (this.winner) {
        this.addLog(`🏆 ${this.winner.name} venceu o império imobiliário!`, '#10B981');
      } else {
        this.addLog("Empate! Todos os jogadores faliram.");
      }
    }
  },

  reset() {
    this.players = [];
    this.activeTurnIndex = 0;
    this.isAnimating = false;
    this.boardSlots = JSON.parse(JSON.stringify(defaultSlots));
    this.logs = [];
    this.startingCapital = 1500;
    this.gamePhase = 'SETUP';
    this.winner = null;

    // Selected action overlay state
    this.landedSlot = null;
    this.canBuyCurrentProperty = false;
    this.showBuyDialog = false;
    this.diceResult = null;
    this.die1 = null;
    this.die2 = null;
    this.displayedDiceResult = null;
    this.displayedDie1 = null;
    this.displayedDie2 = null;
    this.currentEventCard = null;

    // Multiplayer variables
    this.roomCode = null;
    this.roomId = null;
    this.myPlayerId = null;
    this.isMultiplayer = false;
    if (this.realtimeChannel) {
      this.realtimeChannel.unsubscribe();
      this.realtimeChannel = null;
    }

    // Economy Cycles
    this.economicCycle = 'EXPANSION';
    this.interestRate = 0.05;
    this.bankingLiquidity = 10000;
    this.activeEventName = null;
    this.activeEventModifier = 1.0;

    // Auctions
    this.activeAuction = null;
    this.showAuctionDialog = false;

    // Trades
    this.activeTrade = null;
    this.showTradeDialog = false;
    this.incomingTradeProposal = null;
    this.showIncomingTradeDialog = false;

    // AI Integration
    this.isBotThinking = false;
    this.botThinkingPlayerId = null;
    this.aiNewsFeed = [];

    localStorage.removeItem('metropolys_player_id');
  },

  async loadTransparentPins() {
    try {
      const { getTransparentPin } = await import('../utils/imageProcessor');
      for (let i = 1; i <= 8; i++) {
        const pinKey = `pin-${i}`;
        const transparentUrl = await getTransparentPin(`/pins/pin-${i}.png`);
        this.transparentPins[pinKey] = transparentUrl;
      }
    } catch (e) {
      console.error('Failed to load transparent pins:', e);
    }
  }
});

window.addEventListener('supabase-turn-changed', (e) => {
  gameStore.activeTurnIndex = e.detail.activeTurnIndex;
  gameStore.diceResult = null;
  gameStore.die1 = null;
  gameStore.die2 = null;
  gameStore.displayedDiceResult = null;
  gameStore.displayedDie1 = null;
  gameStore.displayedDie2 = null;
});

window.addEventListener('supabase-bot-thinking', (e) => {
  console.log('Bot thinking event received in gameStore:', e.detail);
  gameStore.isBotThinking = e.detail.thinking;
  gameStore.botThinkingPlayerId = e.detail.thinking ? e.detail.playerId : null;
});

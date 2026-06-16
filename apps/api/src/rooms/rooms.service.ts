import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService, Room, Player, Property, Log, Auction, Trade } from '../database/database.service';
import { RoomsGateway } from './rooms.gateway';
import { AiService } from '../ai/ai.service';

// Helper to generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Simple event cards catalog for local fallback
const FALLBACK_EVENTS = [
  { text: "Parabéns! Suas ações imobiliárias subiram. Receba +150", amount: 150 },
  { text: "Manutenção de fachada obrigatória em suas propriedades. Pague 100", amount: -100 },
  { text: "Você ganhou o prêmio de melhor incorporador urbano. Receba +200", amount: 200 },
  { text: "Multa de trânsito perto da prefeitura. Pague 50", amount: -50 },
  { text: "Retorno sobre investimentos do trimestre. Receba +100", amount: 100 },
  { text: "Vazamento de água subterrâneo consertado. Pague 120", amount: -120 },
];

@Injectable()
export class RoomsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly gateway: RoomsGateway,
    private readonly ai: AiService,
  ) {}

  // 1. Create Room
  createRoom(cityCode: string, hostName: string, hostColor: string, hostPin: string | null = null): Room {
    this.db.load();
    const code = generateRoomCode();
    const roomId = 'room-' + Math.random().toString(36).substr(2, 9);
    
    const newRoom: Room = {
      id: roomId,
      code,
      status: 'LOBBY',
      cityCode: cityCode || 'salvador',
      currentRound: 1,
      bankingLiquidity: 10000,
      interestRate: 0.05,
      economicCycle: 'EXPANSION',
      activeEventName: null,
      activeEventModifier: 1.0,
      winnerId: null,
      createdAt: new Date().toISOString(),
    };

    let selectedPin = hostPin;
    if (!selectedPin || selectedPin === 'random') {
      const pinNum = Math.floor(Math.random() * 8) + 1;
      selectedPin = `pin-${pinNum}`;
    }

    const hostId = 'player-' + Math.random().toString(36).substr(2, 9);
    const host: Player = {
      id: hostId,
      roomId,
      name: hostName || 'Anfitrião',
      color: hostColor || '#6366F1',
      money: 1500, // starting capital
      position: 0,
      isBankrupt: false,
      isHost: true,
      isBot: false,
      botPersonality: null,
      isOnline: true,
      pin: selectedPin,
    };

    this.db.rooms.push(newRoom);
    this.db.players.push(host);
    this.db.save();

    console.log(`Room created: ${code} (ID: ${roomId}) with host ${hostName}`);
    return newRoom;
  }

  // 2. Join Room
  joinRoom(code: string, name: string, color: string, isBot = false, botPersonality: any = null, pin: string | null = null): Player {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) {
      throw new NotFoundException(`Room with code ${code} not found`);
    }
    if (room.status !== 'LOBBY') {
      throw new BadRequestException('Match already in progress');
    }

    const roomPlayers = this.db.players.filter(p => p.roomId === room.id);
    if (roomPlayers.length >= 4) {
      throw new BadRequestException('Room is full (max 4 players)');
    }

    let selectedPin = pin;
    if (!selectedPin || selectedPin === 'random') {
      const existingPins = roomPlayers.map(p => p.pin);
      const available = [1, 2, 3, 4, 5, 6, 7, 8]
        .map(n => `pin-${n}`)
        .filter(pPin => !existingPins.includes(pPin));
      
      const sourceList = available.length > 0 ? available : [1, 2, 3, 4, 5, 6, 7, 8].map(n => `pin-${n}`);
      selectedPin = sourceList[Math.floor(Math.random() * sourceList.length)];
    }

    const newPlayer: Player = {
      id: 'player-' + Math.random().toString(36).substr(2, 9),
      roomId: room.id,
      name: name || `Jogador ${roomPlayers.length + 1}`,
      color: color || '#10B981',
      money: 1500,
      position: 0,
      isBankrupt: false,
      isHost: false,
      isBot,
      botPersonality: isBot ? (botPersonality || 'BALANCED') : null,
      isOnline: true,
      pin: selectedPin,
    };

    this.db.players.push(newPlayer);
    this.db.save();

    // Broadcast table update
    this.gateway.broadcastTableUpdate(room.id, 'players', 'INSERT', newPlayer);
    this.addLog(room.id, `${newPlayer.name} entrou no lobby!`, newPlayer.color);

    return newPlayer;
  }

  // Start the match (transitions from LOBBY to PLAYING)
  startMatch(code: string): Room {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    room.status = 'PLAYING';
    
    // Initialize properties list based on active city slots config
    // We will populate them dynamically from frontend/backend registry later.
    // For now, write default 20 slots properties as unowned
    for (let slotId = 0; slotId < 20; slotId++) {
      const prop: Property = {
        roomId: room.id,
        slotId,
        ownerId: null,
        baseCost: this.getCitySlotCost(room.cityCode, slotId),
        currentRent: this.getCitySlotRent(room.cityCode, slotId),
        multiplier: 1.0,
      };
      this.db.properties.push(prop);
    }

    this.db.save();
    
    // Broadcast updates
    this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);
    this.db.properties.filter(p => p.roomId === room.id).forEach(prop => {
      this.gateway.broadcastTableUpdate(room.id, 'properties', 'INSERT', prop);
    });

    this.addLog(room.id, `A partida começou em ${room.cityCode.toUpperCase()}!`, '#38BDF8');

    // Inform first player turn
    const players = this.db.players.filter(p => p.roomId === room.id);
    if (players.length > 0) {
      this.addLog(room.id, `É o turno de ${players[0].name}!`, players[0].color);
      if (players[0].isBot) {
        this.runBotTurn(room.id, players[0].id);
      }
    }

    return room;
  }

  // 3. Roll Dice
  rollDice(code: string, playerId: string): any {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');
    if (room.status !== 'PLAYING') throw new BadRequestException('Match not active');

    const players = this.db.players.filter(p => p.roomId === room.id && !p.isBankrupt);
    const activePlayerIndex = this.getActivePlayerIndex(room.id);
    const activePlayer = players[activePlayerIndex];

    if (!activePlayer || activePlayer.id !== playerId) {
      throw new BadRequestException('Not your turn');
    }

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    const oldPosition = activePlayer.position;
    const newPosition = (oldPosition + roll) % 20; // 20-slot circuit constraint

    activePlayer.position = newPosition;

    // Check passing START (slot 0)
    let passedStart = false;
    if (newPosition < oldPosition && newPosition !== 0) {
      activePlayer.money += 200;
      passedStart = true;
    }

    this.db.save();

    // Broadcast update
    this.gateway.broadcastRoomUpdate(room.id, 'player_moved', {
      playerId: activePlayer.id,
      roll,
      die1,
      die2,
      from: oldPosition,
      to: newPosition,
    });
    this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', activePlayer);
    this.addLog(room.id, `${activePlayer.name} rolou os dados e tirou ${roll} (${die1} + ${die2}).`, activePlayer.color);
    if (passedStart) {
      this.addLog(room.id, `${activePlayer.name} passou pela Partida e ganhou +200!`, '#10B981');
    }

    return {
      playerId: activePlayer.id,
      roll,
      die1,
      die2,
      from: oldPosition,
      to: newPosition,
      money: activePlayer.money,
    };
  }

  // Resolve Landing Slot (Called after Phaser animation is completed on frontend)
  resolveLanding(code: string, playerId: string, slotId: number): any {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const player = this.db.players.find(p => p.id === playerId);
    if (!player) throw new NotFoundException('Player not found');

    player.position = slotId;

    // Perform landing logic
    if (slotId === 0) { // START
      player.money += 200;
      this.addLog(room.id, `${player.name} parou exatamente no START e recebeu +200!`, '#10B981');
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
      return { type: 'START' };
    }

    // Is it a Property, Tax, or Event?
    const slotType = this.getSlotType(slotId);
    if (slotType === 'TAX') {
      const taxAmount = slotId === 4 ? 150 : 200;
      player.money -= taxAmount;
      this.addLog(room.id, `${player.name} foi taxado em ${taxAmount}M.`, '#EF4444');
      this.checkBankruptcy(room.id, player);
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
      return { type: 'TAX', cost: taxAmount };
    }

    if (slotType === 'EVENT') {
      const card = FALLBACK_EVENTS[Math.floor(Math.random() * FALLBACK_EVENTS.length)];
      if (card.amount > 0) {
        player.money += card.amount;
      } else {
        player.money -= Math.abs(card.amount);
      }
      this.addLog(room.id, `Sorte ou Revés: ${card.text}`, card.amount > 0 ? '#10B981' : '#EF4444');
      this.checkBankruptcy(room.id, player);
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
      return { type: 'EVENT', card };
    }

    if (slotType === 'PROPERTY') {
      const prop = this.db.properties.find(p => p.roomId === room.id && p.slotId === slotId);
      if (!prop) return { type: 'PROPERTY', status: 'UNOWNED' };

      if (prop.ownerId === null) {
        return { type: 'PROPERTY', status: 'UNOWNED', cost: prop.baseCost, rent: prop.currentRent };
      } else if (prop.ownerId === player.id) {
        this.addLog(room.id, `${player.name} visitou sua própria propriedade.`);
        return { type: 'PROPERTY', status: 'OWNED_BY_SELF' };
      } else {
        // Opponent property - pay rent!
        const owner = this.db.players.find(p => p.id === prop.ownerId);
        if (owner && !owner.isBankrupt) {
          // Calculate rent with modifier
          const rentDue = Math.floor(prop.currentRent * prop.multiplier * room.activeEventModifier);
          
          if (player.money >= rentDue) {
            player.money -= rentDue;
            owner.money += rentDue;
            this.addLog(room.id, `${player.name} pagou ${rentDue}M de aluguel para ${owner.name}.`, '#EF4444');
          } else {
            const partial = Math.max(0, player.money);
            player.money -= rentDue;
            owner.money += partial;
            this.addLog(room.id, `${player.name} pagou apenas ${partial}M (tudo o que tinha) de aluguel para ${owner.name}.`, '#EF4444');
            this.checkBankruptcy(room.id, player);
          }

          this.db.save();
          this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
          this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', owner);
          return { type: 'PROPERTY', status: 'RENT_PAID', amount: rentDue, owner: owner.name };
        }
      }
    }

    return { type: 'NONE' };
  }

  // 4. Buy Property
  buyProperty(code: string, playerId: string, slotId: number): Property {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const player = this.db.players.find(p => p.id === playerId);
    if (!player) throw new NotFoundException('Player not found');

    const prop = this.db.properties.find(p => p.roomId === room.id && p.slotId === slotId);
    if (!prop) throw new NotFoundException('Property slot not found');
    if (prop.ownerId !== null) throw new BadRequestException('Property already owned');

    if (player.money < prop.baseCost) {
      throw new BadRequestException('Insufficient funds');
    }

    player.money -= prop.baseCost;
    prop.ownerId = player.id;

    // Apply appreciation for dynamic economy rules (adjacent properties owned by same player)
    this.recalculatePropertyValuations(room.id);

    this.db.save();

    // Broadcast table updates
    this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
    this.gateway.broadcastTableUpdate(room.id, 'properties', 'UPDATE', prop);
    this.addLog(room.id, `${player.name} comprou propriedade no Slot ${slotId} por ${prop.baseCost}M!`, player.color);

    this.triggerNewsNarrator(room.id, `${player.name} adquiriu a propriedade no Slot ${slotId} em ${room.cityCode.toUpperCase()} por ${prop.baseCost}M.`);

    return prop;
  }

  // 5. End Turn
  async endTurn(code: string, playerId: string): Promise<Room> {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const players = this.db.players.filter(p => p.roomId === room.id);
    const alivePlayers = players.filter(p => !p.isBankrupt);

    if (alivePlayers.length <= 1) {
      // Game Over
      room.status = 'FINISHED';
      room.winnerId = alivePlayers[0]?.id || null;
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);
      this.addLog(room.id, `🏆 Fim de jogo! ${alivePlayers[0]?.name || 'Ninguém'} venceu a partida!`, '#10B981');
      return room;
    }

    // Advance turn to next alive player
    const activePlayerIndex = this.getActivePlayerIndex(room.id);
    const currentActivePlayer = alivePlayers[activePlayerIndex];
    if (currentActivePlayer && currentActivePlayer.id !== playerId) {
      throw new BadRequestException('Not your turn to end');
    }

    // Calculate next active player index
    const nextIndex = (activePlayerIndex + 1) % alivePlayers.length;
    
    // Set host flag / turn index sequence mapping
    // We update player turns by updating position, logs, or triggering websocket broadcast
    // In our DB structure, turns are sequential based on players order. We rotate by logging
    // the next active player. Let's record the turn rotation explicitly.
    // To identify who is active, we store active index in room metadata or deduce it.
    // Let's increment round counter if we wrap back to index 0
    if (nextIndex === 0) {
      room.currentRound += 1;
      this.addLog(room.id, `--- Rodada ${room.currentRound} Iniciada ---`, '#94A3B8');
      
      // Trigger Economic Cycle shifts every 5 rounds
      if (room.currentRound % 5 === 1) {
        await this.advanceEconomicCycle(room);
      }
    }

    // Set the target player as active by logging the event
    const nextPlayer = alivePlayers[nextIndex];
    this.db.save();

    this.gateway.broadcastRoomUpdate(room.id, 'turn_changed', {
      activePlayerId: nextPlayer.id,
      activeTurnIndex: players.indexOf(nextPlayer),
      round: room.currentRound,
    });

    this.addLog(room.id, `É o turno de ${nextPlayer.name}!`, nextPlayer.color);

    if (nextPlayer.isBot) {
      this.runBotTurn(room.id, nextPlayer.id);
    }

    return room;
  }

  // Take a loan from bank (Dynamic Economy)
  takeLoan(code: string, playerId: string, amount: number): any {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const player = this.db.players.find(p => p.id === playerId);
    if (!player) throw new NotFoundException('Player not found');

    if (room.bankingLiquidity < amount) {
      throw new BadRequestException('Banco sem liquidez para empréstimo');
    }

    // Calculate interest based on cycle
    const interest = Math.floor(amount * room.interestRate);
    player.money += amount;
    room.bankingLiquidity -= amount;

    this.addLog(room.id, `${player.name} pegou empréstimo de ${amount}M com juros de ${interest}M.`, '#F59E0B');
    this.db.save();

    this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
    this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);

    this.triggerNewsNarrator(room.id, `${player.name} pegou empréstimo de ${amount}M com juros de ${interest}M.`);

    return { balance: player.money, bankingLiquidity: room.bankingLiquidity };
  }

  // Recalculate property valuations dynamically based on neighborhood ownership
  private recalculatePropertyValuations(roomId: string) {
    const props = this.db.properties.filter(p => p.roomId === roomId);
    const players = this.db.players.filter(p => p.roomId === roomId);

    props.forEach(prop => {
      // Find adjacent property slots: (slotId - 1 + 20) % 20 and (slotId + 1) % 20
      const leftId = (prop.slotId - 1 + 20) % 20;
      const rightId = (prop.slotId + 1) % 20;
      
      const leftProp = props.find(p => p.slotId === leftId);
      const rightProp = props.find(p => p.slotId === rightId);

      let multiplier = 1.0;
      if (prop.ownerId !== null) {
        if (leftProp && leftProp.ownerId === prop.ownerId) multiplier += 0.15;
        if (rightProp && rightProp.ownerId === prop.ownerId) multiplier += 0.15;
      }
      prop.multiplier = multiplier;
    });
  }

  // Advance the economic cycle (called every 5 rounds)
  private async advanceEconomicCycle(room: Room) {
    const cycles: ('EXPANSION' | 'RECESSION' | 'RECOVERY')[] = ['EXPANSION', 'RECESSION', 'RECOVERY'];
    const currentIdx = cycles.indexOf(room.economicCycle);
    const nextCycle = cycles[(currentIdx + 1) % cycles.length];
    
    room.economicCycle = nextCycle;

    // Get active players standings for AI event generator
    const players = this.db.players.filter(p => p.roomId === room.id);
    let eventName = '';
    let rentMultiplier = 1.0;
    let narrative = '';

    try {
      const aiEvent = await this.ai.generateCityEvent(room.currentRound, players);
      eventName = aiEvent.eventName;
      rentMultiplier = aiEvent.rentMultiplier;
      narrative = aiEvent.narrative;
    } catch (e) {
      console.error('Failed to generate AI event, using fallback', e);
      if (nextCycle === 'EXPANSION') {
        eventName = 'Crescimento Imobiliário';
        rentMultiplier = 1.25;
        narrative = 'O mercado imobiliário local está aquecido com novos investimentos.';
      } else if (nextCycle === 'RECESSION') {
        eventName = 'Crise de Liquidez';
        rentMultiplier = 0.8;
        narrative = 'Restrições de crédito diminuíram o volume de negociações.';
      } else {
        eventName = 'Estabilização';
        rentMultiplier = 1.0;
        narrative = 'O mercado imobiliário retornou a níveis estáveis.';
      }
    }

    room.activeEventName = eventName;
    room.activeEventModifier = rentMultiplier;

    if (nextCycle === 'EXPANSION') {
      room.interestRate = 0.08;
    } else if (nextCycle === 'RECESSION') {
      room.interestRate = 0.03;
    } else {
      room.interestRate = 0.05;
    }

    this.addLog(room.id, `🚨 Ciclo Econômico: ${nextCycle}. Evento: ${eventName} (Modificador: x${rentMultiplier}). Juros em ${room.interestRate * 100}%.`, nextCycle === 'EXPANSION' ? '#10B981' : nextCycle === 'RECESSION' ? '#EF4444' : '#3B82F6');
    this.addLog(room.id, `Narrativa: ${narrative}`, '#94A3B8');

    this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);
    
    await this.triggerNewsNarrator(room.id, `Ciclo econômico mudou para ${nextCycle}. Evento: ${eventName}. ${narrative}`);
  }

  // Verify bankruptcy
  private checkBankruptcy(roomId: string, player: Player) {
    if (player.money < 0) {
      // release properties
      player.isBankrupt = true;
      const props = this.db.properties.filter(p => p.roomId === roomId && p.ownerId === player.id);
      props.forEach(p => {
        p.ownerId = null;
        p.multiplier = 1.0;
        this.gateway.broadcastTableUpdate(roomId, 'properties', 'UPDATE', p);
      });
      this.addLog(roomId, `🚨 ${player.name} DECRETOU FALÊNCIA! Suas propriedades voltaram ao mercado.`, '#EF4444');
      this.triggerNewsNarrator(roomId, `Colapso financeiro: O jogador ${player.name} faliu! Suas propriedades voltaram ao mercado.`);
    }
  }

  // Get index of active player inside alive list
  private getActivePlayerIndex(roomId: string): number {
    const room = this.db.rooms.find(r => r.id === roomId);
    // Standard turn index: simple calculation based on current logs or round sequence
    // Let's implement active turn matching logic
    // We count logs of turn transitions or roll dice triggers to determine active index
    const logs = this.db.logs.filter(l => l.roomId === roomId && l.text.includes('É o turno de'));
    if (logs.length === 0) return 0;
    
    // Parse latest player name
    const latestLog = logs[0];
    const match = latestLog.text.match(/É o turno de (.*)!/);
    if (!match) return 0;
    
    const name = match[1];
    const players = this.db.players.filter(p => p.roomId === roomId && !p.isBankrupt);
    const index = players.findIndex(p => p.name === name);
    return index === -1 ? 0 : index;
  }

  // Add Log Entry
  addLog(roomId: string, message: string, color: string | null = null): Log {
    const newLog: Log = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      roomId,
      text: message,
      color,
      createdAt: new Date().toISOString(),
    };
    this.db.logs.unshift(newLog);
    this.db.save();

    this.gateway.broadcastTableUpdate(roomId, 'logs', 'INSERT', newLog);
    return newLog;
  }

  // --- AUCTIONS (MVP 3) ---

  startAuction(code: string, slotId: number): Auction {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const prop = this.db.properties.find(p => p.roomId === room.id && p.slotId === slotId);
    if (!prop) throw new NotFoundException('Property not found');
    if (prop.ownerId !== null) throw new BadRequestException('Property already owned');

    const auctionId = 'auction-' + Math.random().toString(36).substr(2, 9);
    const newAuction: Auction = {
      id: auctionId,
      roomId: room.id,
      slotId,
      highestBid: Math.floor(prop.baseCost * 0.7), // starts at 70% of base cost
      highestBidderId: null,
      endsAt: new Date(Date.now() + 30 * 1000).toISOString(),
      status: 'ACTIVE',
    };

    this.db.auctions.push(newAuction);
    this.db.save();

    this.gateway.broadcastTableUpdate(room.id, 'auctions', 'INSERT', newAuction);
    this.addLog(room.id, `Leilão iniciado para a propriedade no Slot ${slotId}! Lance inicial: ${newAuction.highestBid}M.`, '#3B82F6');

    this.scheduleAuctionEndCheck(room.id, auctionId);

    return newAuction;
  }

  placeBid(code: string, auctionId: string, playerId: string, bidAmount: number): Auction {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const auction = this.db.auctions.find(a => a.id === auctionId && a.status === 'ACTIVE');
    if (!auction) throw new BadRequestException('Auction not active');

    const player = this.db.players.find(p => p.id === playerId);
    if (!player || player.isBankrupt) throw new BadRequestException('Invalid bidder');

    if (bidAmount <= auction.highestBid) {
      throw new BadRequestException('Bid must be higher than current highest bid');
    }
    if (player.money < bidAmount) {
      throw new BadRequestException('Insufficient funds');
    }

    auction.highestBid = bidAmount;
    auction.highestBidderId = playerId;

    // Sniper protection: if less than 10s remaining, extend by 10s
    const now = Date.now();
    const endsAtMs = new Date(auction.endsAt).getTime();
    if (endsAtMs - now < 10 * 1000) {
      auction.endsAt = new Date(now + 10 * 1000).toISOString();
      this.addLog(room.id, `Novo lance de ${bidAmount}M por ${player.name}. Tempo estendido em 10s!`, '#38BDF8');
    } else {
      this.addLog(room.id, `Novo lance de ${bidAmount}M por ${player.name}.`, player.color);
    }

    this.db.save();
    this.gateway.broadcastTableUpdate(room.id, 'auctions', 'UPDATE', auction);

    this.scheduleAuctionEndCheck(room.id, auctionId);

    return auction;
  }

  private scheduleAuctionEndCheck(roomId: string, auctionId: string) {
    const check = () => {
      this.db.load();
      const auction = this.db.auctions.find(a => a.id === auctionId);
      if (!auction || auction.status !== 'ACTIVE') return;

      const now = Date.now();
      const endsAtMs = new Date(auction.endsAt).getTime();
      const diff = endsAtMs - now;

      if (diff <= 0) {
        this.resolveAuction(roomId, auctionId);
      } else {
        setTimeout(check, diff);
      }
    };

    const auction = this.db.auctions.find(a => a.id === auctionId);
    if (auction) {
      const diff = new Date(auction.endsAt).getTime() - Date.now();
      setTimeout(check, Math.max(0, diff));
    }
  }

  private resolveAuction(roomId: string, auctionId: string) {
    this.db.load();
    const auction = this.db.auctions.find(a => a.id === auctionId && a.status === 'ACTIVE');
    if (!auction) return;

    auction.status = 'FINISHED';
    
    if (auction.highestBidderId) {
      const winner = this.db.players.find(p => p.id === auction.highestBidderId);
      const prop = this.db.properties.find(p => p.roomId === roomId && p.slotId === auction.slotId);

      if (winner && prop && winner.money >= auction.highestBid) {
        winner.money -= auction.highestBid;
        prop.ownerId = winner.id;
        this.recalculatePropertyValuations(roomId);
        this.addLog(roomId, `Leilão encerrado! ${winner.name} arrematou a propriedade no Slot ${auction.slotId} por ${auction.highestBid}M!`, winner.color);
        this.gateway.broadcastTableUpdate(roomId, 'players', 'UPDATE', winner);
        this.gateway.broadcastTableUpdate(roomId, 'properties', 'UPDATE', prop);
        this.triggerNewsNarrator(roomId, `Vendido! ${winner.name} venceu o leilão e arrematou o Slot ${auction.slotId} por ${auction.highestBid}M!`);
      } else {
        this.addLog(roomId, `Leilão encerrado sem ofertas válidas.`);
      }
    } else {
      this.addLog(roomId, `Leilão encerrado. Sem lances.`);
    }

    this.db.save();
    this.gateway.broadcastTableUpdate(roomId, 'auctions', 'UPDATE', auction);
  }

  // --- BILATERAL TRADING (P2P) ---

  proposeTrade(
    code: string,
    senderId: string,
    receiverId: string,
    offerCash: number,
    offerProperties: number[],
    requestProperties: number[],
  ): Trade {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const sender = this.db.players.find(p => p.id === senderId);
    const receiver = this.db.players.find(p => p.id === receiverId);

    if (!sender || !receiver || sender.isBankrupt || receiver.isBankrupt) {
      throw new BadRequestException('Invalid trading players');
    }

    if (sender.money < offerCash) {
      throw new BadRequestException('Sender has insufficient cash');
    }

    // Verify sender owns all offered properties
    const props = this.db.properties.filter(p => p.roomId === room.id);
    for (const slotId of offerProperties) {
      const p = props.find(x => x.slotId === slotId);
      if (!p || p.ownerId !== senderId) {
        throw new BadRequestException(`Sender does not own property slot ${slotId}`);
      }
    }

    // Verify receiver owns all requested properties
    for (const slotId of requestProperties) {
      const p = props.find(x => x.slotId === slotId);
      if (!p || p.ownerId !== receiverId) {
        throw new BadRequestException(`Receiver does not own property slot ${slotId}`);
      }
    }

    const tradeId = 'trade-' + Math.random().toString(36).substr(2, 9);
    const newTrade: Trade = {
      id: tradeId,
      roomId: room.id,
      senderId,
      receiverId,
      offerCash,
      offerProperties,
      requestProperties,
      status: 'PENDING',
    };

    this.db.trades.push(newTrade);
    this.db.save();

    this.gateway.broadcastTableUpdate(room.id, 'trades', 'INSERT', newTrade);
    this.addLog(room.id, `${sender.name} propôs uma negociação comercial para ${receiver.name}!`, '#EC4899');

    return newTrade;
  }

  resolveTrade(code: string, tradeId: string, resolution: 'ACCEPTED' | 'DECLINED'): Trade {
    this.db.load();
    const room = this.db.rooms.find(r => r.code === code);
    if (!room) throw new NotFoundException('Room not found');

    const trade = this.db.trades.find(t => t.id === tradeId && t.status === 'PENDING');
    if (!trade) throw new BadRequestException('No pending trade found');

    if (resolution === 'DECLINED') {
      trade.status = 'DECLINED';
      const sender = this.db.players.find(p => p.id === trade.senderId);
      const receiver = this.db.players.find(p => p.id === trade.receiverId);
      this.addLog(room.id, `${receiver?.name || 'O destinatário'} recusou a oferta de troca de ${sender?.name || 'do remetente'}.`, '#EF4444');
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
      return trade;
    }

    // ACCEPTED
    const sender = this.db.players.find(p => p.id === trade.senderId);
    const receiver = this.db.players.find(p => p.id === trade.receiverId);

    if (!sender || !receiver || sender.isBankrupt || receiver.isBankrupt) {
      trade.status = 'EXPIRED';
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
      throw new BadRequestException('One of the trading parties is no longer active');
    }

    if (sender.money < trade.offerCash) {
      trade.status = 'EXPIRED';
      this.db.save();
      this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
      throw new BadRequestException('Sender no longer has the offered cash');
    }

    const props = this.db.properties.filter(p => p.roomId === room.id);
    
    // Verify sender still owns properties
    for (const slotId of trade.offerProperties) {
      const p = props.find(x => x.slotId === slotId);
      if (!p || p.ownerId !== trade.senderId) {
        trade.status = 'EXPIRED';
        this.db.save();
        this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
        throw new BadRequestException(`Transaction failed: Property ${slotId} ownership changed`);
      }
    }

    // Verify receiver still owns properties
    for (const slotId of trade.requestProperties) {
      const p = props.find(x => x.slotId === slotId);
      if (!p || p.ownerId !== trade.receiverId) {
        trade.status = 'EXPIRED';
        this.db.save();
        this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
        throw new BadRequestException(`Transaction failed: Requested property ${slotId} ownership changed`);
      }
    }

    // Execute transfers
    sender.money -= trade.offerCash;
    receiver.money += trade.offerCash;

    // Swap properties
    trade.offerProperties.forEach(slotId => {
      const p = props.find(x => x.slotId === slotId);
      if (p) p.ownerId = receiver.id;
    });

    trade.requestProperties.forEach(slotId => {
      const p = props.find(x => x.slotId === slotId);
      if (p) p.ownerId = sender.id;
    });

    trade.status = 'ACCEPTED';
    
    // Recalculate dynamic valuations
    this.recalculatePropertyValuations(room.id);

    this.db.save();

    // Broadcast all updates
    this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', sender);
    this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', receiver);
    props.forEach(p => {
      this.gateway.broadcastTableUpdate(room.id, 'properties', 'UPDATE', p);
    });
    this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);

    this.addLog(room.id, `Acordo comercial selado! Troca efetuada entre ${sender.name} e ${receiver.name}.`, '#10B981');

    return trade;
  }

  // --- AI INTEGRATION: BOT PLAYERS & NARRATOR (MVP 5) ---

  async triggerNewsNarrator(roomId: string, eventDescription: string) {
    const news = await this.ai.generateNewsCommentary(eventDescription);
    const newsId = 'news-' + Math.random().toString(36).substr(2, 9);
    const newEntry = {
      id: newsId,
      roomId,
      headline: news.headline,
      body: news.body,
      createdAt: new Date().toISOString(),
    };
    
    this.db.load();
    this.db.aiNews.unshift(newEntry);
    this.db.save();
    
    this.gateway.broadcastTableUpdate(roomId, 'ai_news', 'INSERT', newEntry);
  }

  runBotTurn(roomId: string, playerId: string) {
    console.log(`Bot Execution: Starting turn for Player: ${playerId} in Room: ${roomId}`);
    
    // 2-second delay to simulate bot thinking ("Pensando...")
    setTimeout(async () => {
      this.db.load();
      const room = this.db.rooms.find(r => r.id === roomId);
      if (!room || room.status !== 'PLAYING') return;

      const player = this.db.players.find(p => p.id === playerId);
      if (!player || player.isBankrupt || !player.isBot) return;

      // Broadcast bot is thinking
      this.gateway.broadcastRoomUpdate(roomId, 'bot_thinking', { playerId, thinking: true });

      // Step 1: Roll Dice
      const rollDetails = this.rollDice(room.code, playerId);
      
      // Broadcast bot finished thinking
      this.gateway.broadcastRoomUpdate(roomId, 'bot_thinking', { playerId, thinking: false });

      // Calculate delay matching Phaser token animation duration
      const movementDelay = (rollDetails.roll * 250) + 3200; // Added 2000ms to account for the new dice rolling animation
      
      setTimeout(async () => {
        // Step 2: Resolve Landing
        const resolution = this.resolveLanding(room.code, playerId, rollDetails.to);

        // Step 3: Action Decision
        if (resolution.type === 'PROPERTY' && resolution.status === 'UNOWNED') {
          const landedSlot = { id: rollDetails.to, cost: resolution.cost, rent: resolution.rent };
          
          // Get decision from Gemini or Fallback
          const propertiesOwned = this.db.properties
            .filter(p => p.roomId === roomId && p.ownerId === playerId)
            .map(p => p.slotId);

          const decision = await this.ai.getBotDecision(
            player.botPersonality || 'BALANCED',
            { money: player.money, propertiesOwned },
            landedSlot,
            'BUY',
          );

          this.addLog(roomId, `Bot ${player.name} decidiu: ${decision.rationale}`, '#F59E0B');

          if (decision.action === 'BUY' && player.money >= landedSlot.cost) {
            this.buyProperty(room.code, playerId, landedSlot.id);
          } else {
            // Decline triggers auction!
            this.startAuction(room.code, landedSlot.id);
          }
        }

        // Delay 1.5s before advancing turn
        setTimeout(() => {
          this.endTurn(room.code, playerId);
        }, 1500);

      }, movementDelay);

    }, 2000);
  }

  // Helper metadata configs
  private getSlotType(slotId: number): 'START' | 'PROPERTY' | 'TAX' | 'EVENT' {
    if (slotId === 0) return 'START';
    if (slotId === 4 || slotId === 12) return 'TAX';
    if (slotId === 7 || slotId === 17) return 'EVENT';
    return 'PROPERTY';
  }

  private getCitySlotCost(cityCode: string, slotId: number): number {
    if (cityCode === 'sao-paulo') {
      const costs = [0, 130, 150, 180, 150, 220, 240, 0, 260, 280, 320, 340, 200, 380, 420, 80, 100, 0, 110, 120];
      return costs[slotId] || 150;
    }
    if (cityCode === 'rio-de-janeiro') {
      const costs = [0, 120, 140, 160, 150, 210, 230, 0, 250, 270, 310, 330, 200, 370, 410, 70, 90, 0, 100, 110];
      return costs[slotId] || 150;
    }
    // Default (salvador / original)
    const costs = [0, 120, 140, 160, 150, 200, 220, 0, 240, 260, 300, 320, 200, 350, 400, 70, 90, 0, 100, 110];
    return costs[slotId] || 150;
  }

  private getCitySlotRent(cityCode: string, slotId: number): number {
    if (cityCode === 'sao-paulo') {
      const rents = [0, 13, 15, 18, 0, 22, 24, 0, 26, 28, 32, 34, 0, 38, 42, 8, 10, 0, 11, 12];
      return rents[slotId] || 15;
    }
    if (cityCode === 'rio-de-janeiro') {
      const rents = [0, 12, 14, 16, 0, 21, 23, 0, 25, 27, 31, 33, 0, 37, 41, 7, 9, 0, 10, 11];
      return rents[slotId] || 15;
    }
    // Default (salvador / original)
    const rents = [0, 12, 14, 16, 0, 20, 22, 0, 24, 26, 30, 32, 0, 35, 40, 7, 9, 0, 10, 11];
    return rents[slotId] || 15;
  }
}

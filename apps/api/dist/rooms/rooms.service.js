"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const rooms_gateway_1 = require("./rooms.gateway");
const ai_service_1 = require("../ai/ai.service");
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
const FALLBACK_EVENTS = [
    { text: "Parabéns! Suas ações imobiliárias subiram. Receba +150", amount: 150 },
    { text: "Manutenção de fachada obrigatória em suas propriedades. Pague 100", amount: -100 },
    { text: "Você ganhou o prêmio de melhor incorporador urbano. Receba +200", amount: 200 },
    { text: "Multa de trânsito perto da prefeitura. Pague 50", amount: -50 },
    { text: "Retorno sobre investimentos do trimestre. Receba +100", amount: 100 },
    { text: "Vazamento de água subterrâneo consertado. Pague 120", amount: -120 },
];
let RoomsService = class RoomsService {
    db;
    gateway;
    ai;
    constructor(db, gateway, ai) {
        this.db = db;
        this.gateway = gateway;
        this.ai = ai;
    }
    createRoom(cityCode, hostName, hostColor, hostPin = null) {
        this.db.load();
        const code = generateRoomCode();
        const roomId = 'room-' + Math.random().toString(36).substr(2, 9);
        const newRoom = {
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
        const host = {
            id: hostId,
            roomId,
            name: hostName || 'Anfitrião',
            color: hostColor || '#6366F1',
            money: 1500,
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
    joinRoom(code, name, color, isBot = false, botPersonality = null, pin = null) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room) {
            throw new common_1.NotFoundException(`Room with code ${code} not found`);
        }
        if (room.status !== 'LOBBY') {
            throw new common_1.BadRequestException('Match already in progress');
        }
        const roomPlayers = this.db.players.filter(p => p.roomId === room.id);
        if (roomPlayers.length >= 4) {
            throw new common_1.BadRequestException('Room is full (max 4 players)');
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
        const newPlayer = {
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
        this.gateway.broadcastTableUpdate(room.id, 'players', 'INSERT', newPlayer);
        this.addLog(room.id, `${newPlayer.name} entrou no lobby!`, newPlayer.color);
        return newPlayer;
    }
    startMatch(code) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        room.status = 'PLAYING';
        for (let slotId = 0; slotId < 20; slotId++) {
            const prop = {
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
        this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);
        this.db.properties.filter(p => p.roomId === room.id).forEach(prop => {
            this.gateway.broadcastTableUpdate(room.id, 'properties', 'INSERT', prop);
        });
        this.addLog(room.id, `A partida começou em ${room.cityCode.toUpperCase()}!`, '#38BDF8');
        const players = this.db.players.filter(p => p.roomId === room.id);
        if (players.length > 0) {
            this.addLog(room.id, `É o turno de ${players[0].name}!`, players[0].color);
            if (players[0].isBot) {
                this.runBotTurn(room.id, players[0].id);
            }
        }
        return room;
    }
    rollDice(code, playerId) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        if (room.status !== 'PLAYING')
            throw new common_1.BadRequestException('Match not active');
        const players = this.db.players.filter(p => p.roomId === room.id && !p.isBankrupt);
        const activePlayerIndex = this.getActivePlayerIndex(room.id);
        const activePlayer = players[activePlayerIndex];
        if (!activePlayer || activePlayer.id !== playerId) {
            throw new common_1.BadRequestException('Not your turn');
        }
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const roll = die1 + die2;
        const oldPosition = activePlayer.position;
        const newPosition = (oldPosition + roll) % 20;
        activePlayer.position = newPosition;
        let passedStart = false;
        if (newPosition < oldPosition && newPosition !== 0) {
            activePlayer.money += 200;
            passedStart = true;
        }
        this.db.save();
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
    resolveLanding(code, playerId, slotId) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const player = this.db.players.find(p => p.id === playerId);
        if (!player)
            throw new common_1.NotFoundException('Player not found');
        player.position = slotId;
        if (slotId === 0) {
            player.money += 200;
            this.addLog(room.id, `${player.name} parou exatamente no START e recebeu +200!`, '#10B981');
            this.db.save();
            this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
            return { type: 'START' };
        }
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
            }
            else {
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
            if (!prop)
                return { type: 'PROPERTY', status: 'UNOWNED' };
            if (prop.ownerId === null) {
                return { type: 'PROPERTY', status: 'UNOWNED', cost: prop.baseCost, rent: prop.currentRent };
            }
            else if (prop.ownerId === player.id) {
                this.addLog(room.id, `${player.name} visitou sua própria propriedade.`);
                return { type: 'PROPERTY', status: 'OWNED_BY_SELF' };
            }
            else {
                const owner = this.db.players.find(p => p.id === prop.ownerId);
                if (owner && !owner.isBankrupt) {
                    const rentDue = Math.floor(prop.currentRent * prop.multiplier * room.activeEventModifier);
                    if (player.money >= rentDue) {
                        player.money -= rentDue;
                        owner.money += rentDue;
                        this.addLog(room.id, `${player.name} pagou ${rentDue}M de aluguel para ${owner.name}.`, '#EF4444');
                    }
                    else {
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
    buyProperty(code, playerId, slotId) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const player = this.db.players.find(p => p.id === playerId);
        if (!player)
            throw new common_1.NotFoundException('Player not found');
        const prop = this.db.properties.find(p => p.roomId === room.id && p.slotId === slotId);
        if (!prop)
            throw new common_1.NotFoundException('Property slot not found');
        if (prop.ownerId !== null)
            throw new common_1.BadRequestException('Property already owned');
        if (player.money < prop.baseCost) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        player.money -= prop.baseCost;
        prop.ownerId = player.id;
        this.recalculatePropertyValuations(room.id);
        this.db.save();
        this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', player);
        this.gateway.broadcastTableUpdate(room.id, 'properties', 'UPDATE', prop);
        this.addLog(room.id, `${player.name} comprou propriedade no Slot ${slotId} por ${prop.baseCost}M!`, player.color);
        this.triggerNewsNarrator(room.id, `${player.name} adquiriu a propriedade no Slot ${slotId} em ${room.cityCode.toUpperCase()} por ${prop.baseCost}M.`);
        return prop;
    }
    async endTurn(code, playerId) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const players = this.db.players.filter(p => p.roomId === room.id);
        const alivePlayers = players.filter(p => !p.isBankrupt);
        if (alivePlayers.length <= 1) {
            room.status = 'FINISHED';
            room.winnerId = alivePlayers[0]?.id || null;
            this.db.save();
            this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);
            this.addLog(room.id, `🏆 Fim de jogo! ${alivePlayers[0]?.name || 'Ninguém'} venceu a partida!`, '#10B981');
            return room;
        }
        const activePlayerIndex = this.getActivePlayerIndex(room.id);
        const currentActivePlayer = alivePlayers[activePlayerIndex];
        if (currentActivePlayer && currentActivePlayer.id !== playerId) {
            throw new common_1.BadRequestException('Not your turn to end');
        }
        const nextIndex = (activePlayerIndex + 1) % alivePlayers.length;
        if (nextIndex === 0) {
            room.currentRound += 1;
            this.addLog(room.id, `--- Rodada ${room.currentRound} Iniciada ---`, '#94A3B8');
            if (room.currentRound % 5 === 1) {
                await this.advanceEconomicCycle(room);
            }
        }
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
    takeLoan(code, playerId, amount) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const player = this.db.players.find(p => p.id === playerId);
        if (!player)
            throw new common_1.NotFoundException('Player not found');
        if (room.bankingLiquidity < amount) {
            throw new common_1.BadRequestException('Banco sem liquidez para empréstimo');
        }
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
    recalculatePropertyValuations(roomId) {
        const props = this.db.properties.filter(p => p.roomId === roomId);
        const players = this.db.players.filter(p => p.roomId === roomId);
        props.forEach(prop => {
            const leftId = (prop.slotId - 1 + 20) % 20;
            const rightId = (prop.slotId + 1) % 20;
            const leftProp = props.find(p => p.slotId === leftId);
            const rightProp = props.find(p => p.slotId === rightId);
            let multiplier = 1.0;
            if (prop.ownerId !== null) {
                if (leftProp && leftProp.ownerId === prop.ownerId)
                    multiplier += 0.15;
                if (rightProp && rightProp.ownerId === prop.ownerId)
                    multiplier += 0.15;
            }
            prop.multiplier = multiplier;
        });
    }
    async advanceEconomicCycle(room) {
        const cycles = ['EXPANSION', 'RECESSION', 'RECOVERY'];
        const currentIdx = cycles.indexOf(room.economicCycle);
        const nextCycle = cycles[(currentIdx + 1) % cycles.length];
        room.economicCycle = nextCycle;
        const players = this.db.players.filter(p => p.roomId === room.id);
        let eventName = '';
        let rentMultiplier = 1.0;
        let narrative = '';
        try {
            const aiEvent = await this.ai.generateCityEvent(room.currentRound, players);
            eventName = aiEvent.eventName;
            rentMultiplier = aiEvent.rentMultiplier;
            narrative = aiEvent.narrative;
        }
        catch (e) {
            console.error('Failed to generate AI event, using fallback', e);
            if (nextCycle === 'EXPANSION') {
                eventName = 'Crescimento Imobiliário';
                rentMultiplier = 1.25;
                narrative = 'O mercado imobiliário local está aquecido com novos investimentos.';
            }
            else if (nextCycle === 'RECESSION') {
                eventName = 'Crise de Liquidez';
                rentMultiplier = 0.8;
                narrative = 'Restrições de crédito diminuíram o volume de negociações.';
            }
            else {
                eventName = 'Estabilização';
                rentMultiplier = 1.0;
                narrative = 'O mercado imobiliário retornou a níveis estáveis.';
            }
        }
        room.activeEventName = eventName;
        room.activeEventModifier = rentMultiplier;
        if (nextCycle === 'EXPANSION') {
            room.interestRate = 0.08;
        }
        else if (nextCycle === 'RECESSION') {
            room.interestRate = 0.03;
        }
        else {
            room.interestRate = 0.05;
        }
        this.addLog(room.id, `🚨 Ciclo Econômico: ${nextCycle}. Evento: ${eventName} (Modificador: x${rentMultiplier}). Juros em ${room.interestRate * 100}%.`, nextCycle === 'EXPANSION' ? '#10B981' : nextCycle === 'RECESSION' ? '#EF4444' : '#3B82F6');
        this.addLog(room.id, `Narrativa: ${narrative}`, '#94A3B8');
        this.gateway.broadcastTableUpdate(room.id, 'rooms', 'UPDATE', room);
        await this.triggerNewsNarrator(room.id, `Ciclo econômico mudou para ${nextCycle}. Evento: ${eventName}. ${narrative}`);
    }
    checkBankruptcy(roomId, player) {
        if (player.money < 0) {
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
    getActivePlayerIndex(roomId) {
        const room = this.db.rooms.find(r => r.id === roomId);
        const logs = this.db.logs.filter(l => l.roomId === roomId && l.text.includes('É o turno de'));
        if (logs.length === 0)
            return 0;
        const latestLog = logs[0];
        const match = latestLog.text.match(/É o turno de (.*)!/);
        if (!match)
            return 0;
        const name = match[1];
        const players = this.db.players.filter(p => p.roomId === roomId && !p.isBankrupt);
        const index = players.findIndex(p => p.name === name);
        return index === -1 ? 0 : index;
    }
    addLog(roomId, message, color = null) {
        const newLog = {
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
    startAuction(code, slotId) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const prop = this.db.properties.find(p => p.roomId === room.id && p.slotId === slotId);
        if (!prop)
            throw new common_1.NotFoundException('Property not found');
        if (prop.ownerId !== null)
            throw new common_1.BadRequestException('Property already owned');
        const auctionId = 'auction-' + Math.random().toString(36).substr(2, 9);
        const newAuction = {
            id: auctionId,
            roomId: room.id,
            slotId,
            highestBid: Math.floor(prop.baseCost * 0.7),
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
    placeBid(code, auctionId, playerId, bidAmount) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const auction = this.db.auctions.find(a => a.id === auctionId && a.status === 'ACTIVE');
        if (!auction)
            throw new common_1.BadRequestException('Auction not active');
        const player = this.db.players.find(p => p.id === playerId);
        if (!player || player.isBankrupt)
            throw new common_1.BadRequestException('Invalid bidder');
        if (bidAmount <= auction.highestBid) {
            throw new common_1.BadRequestException('Bid must be higher than current highest bid');
        }
        if (player.money < bidAmount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        auction.highestBid = bidAmount;
        auction.highestBidderId = playerId;
        const now = Date.now();
        const endsAtMs = new Date(auction.endsAt).getTime();
        if (endsAtMs - now < 10 * 1000) {
            auction.endsAt = new Date(now + 10 * 1000).toISOString();
            this.addLog(room.id, `Novo lance de ${bidAmount}M por ${player.name}. Tempo estendido em 10s!`, '#38BDF8');
        }
        else {
            this.addLog(room.id, `Novo lance de ${bidAmount}M por ${player.name}.`, player.color);
        }
        this.db.save();
        this.gateway.broadcastTableUpdate(room.id, 'auctions', 'UPDATE', auction);
        this.scheduleAuctionEndCheck(room.id, auctionId);
        return auction;
    }
    scheduleAuctionEndCheck(roomId, auctionId) {
        const check = () => {
            this.db.load();
            const auction = this.db.auctions.find(a => a.id === auctionId);
            if (!auction || auction.status !== 'ACTIVE')
                return;
            const now = Date.now();
            const endsAtMs = new Date(auction.endsAt).getTime();
            const diff = endsAtMs - now;
            if (diff <= 0) {
                this.resolveAuction(roomId, auctionId);
            }
            else {
                setTimeout(check, diff);
            }
        };
        const auction = this.db.auctions.find(a => a.id === auctionId);
        if (auction) {
            const diff = new Date(auction.endsAt).getTime() - Date.now();
            setTimeout(check, Math.max(0, diff));
        }
    }
    resolveAuction(roomId, auctionId) {
        this.db.load();
        const auction = this.db.auctions.find(a => a.id === auctionId && a.status === 'ACTIVE');
        if (!auction)
            return;
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
            }
            else {
                this.addLog(roomId, `Leilão encerrado sem ofertas válidas.`);
            }
        }
        else {
            this.addLog(roomId, `Leilão encerrado. Sem lances.`);
        }
        this.db.save();
        this.gateway.broadcastTableUpdate(roomId, 'auctions', 'UPDATE', auction);
    }
    proposeTrade(code, senderId, receiverId, offerCash, offerProperties, requestProperties) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const sender = this.db.players.find(p => p.id === senderId);
        const receiver = this.db.players.find(p => p.id === receiverId);
        if (!sender || !receiver || sender.isBankrupt || receiver.isBankrupt) {
            throw new common_1.BadRequestException('Invalid trading players');
        }
        if (sender.money < offerCash) {
            throw new common_1.BadRequestException('Sender has insufficient cash');
        }
        const props = this.db.properties.filter(p => p.roomId === room.id);
        for (const slotId of offerProperties) {
            const p = props.find(x => x.slotId === slotId);
            if (!p || p.ownerId !== senderId) {
                throw new common_1.BadRequestException(`Sender does not own property slot ${slotId}`);
            }
        }
        for (const slotId of requestProperties) {
            const p = props.find(x => x.slotId === slotId);
            if (!p || p.ownerId !== receiverId) {
                throw new common_1.BadRequestException(`Receiver does not own property slot ${slotId}`);
            }
        }
        const tradeId = 'trade-' + Math.random().toString(36).substr(2, 9);
        const newTrade = {
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
    resolveTrade(code, tradeId, resolution) {
        this.db.load();
        const room = this.db.rooms.find(r => r.code === code);
        if (!room)
            throw new common_1.NotFoundException('Room not found');
        const trade = this.db.trades.find(t => t.id === tradeId && t.status === 'PENDING');
        if (!trade)
            throw new common_1.BadRequestException('No pending trade found');
        if (resolution === 'DECLINED') {
            trade.status = 'DECLINED';
            const sender = this.db.players.find(p => p.id === trade.senderId);
            const receiver = this.db.players.find(p => p.id === trade.receiverId);
            this.addLog(room.id, `${receiver?.name || 'O destinatário'} recusou a oferta de troca de ${sender?.name || 'do remetente'}.`, '#EF4444');
            this.db.save();
            this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
            return trade;
        }
        const sender = this.db.players.find(p => p.id === trade.senderId);
        const receiver = this.db.players.find(p => p.id === trade.receiverId);
        if (!sender || !receiver || sender.isBankrupt || receiver.isBankrupt) {
            trade.status = 'EXPIRED';
            this.db.save();
            this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
            throw new common_1.BadRequestException('One of the trading parties is no longer active');
        }
        if (sender.money < trade.offerCash) {
            trade.status = 'EXPIRED';
            this.db.save();
            this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
            throw new common_1.BadRequestException('Sender no longer has the offered cash');
        }
        const props = this.db.properties.filter(p => p.roomId === room.id);
        for (const slotId of trade.offerProperties) {
            const p = props.find(x => x.slotId === slotId);
            if (!p || p.ownerId !== trade.senderId) {
                trade.status = 'EXPIRED';
                this.db.save();
                this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
                throw new common_1.BadRequestException(`Transaction failed: Property ${slotId} ownership changed`);
            }
        }
        for (const slotId of trade.requestProperties) {
            const p = props.find(x => x.slotId === slotId);
            if (!p || p.ownerId !== trade.receiverId) {
                trade.status = 'EXPIRED';
                this.db.save();
                this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
                throw new common_1.BadRequestException(`Transaction failed: Requested property ${slotId} ownership changed`);
            }
        }
        sender.money -= trade.offerCash;
        receiver.money += trade.offerCash;
        trade.offerProperties.forEach(slotId => {
            const p = props.find(x => x.slotId === slotId);
            if (p)
                p.ownerId = receiver.id;
        });
        trade.requestProperties.forEach(slotId => {
            const p = props.find(x => x.slotId === slotId);
            if (p)
                p.ownerId = sender.id;
        });
        trade.status = 'ACCEPTED';
        this.recalculatePropertyValuations(room.id);
        this.db.save();
        this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', sender);
        this.gateway.broadcastTableUpdate(room.id, 'players', 'UPDATE', receiver);
        props.forEach(p => {
            this.gateway.broadcastTableUpdate(room.id, 'properties', 'UPDATE', p);
        });
        this.gateway.broadcastTableUpdate(room.id, 'trades', 'UPDATE', trade);
        this.addLog(room.id, `Acordo comercial selado! Troca efetuada entre ${sender.name} e ${receiver.name}.`, '#10B981');
        return trade;
    }
    async triggerNewsNarrator(roomId, eventDescription) {
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
    runBotTurn(roomId, playerId) {
        console.log(`Bot Execution: Starting turn for Player: ${playerId} in Room: ${roomId}`);
        setTimeout(async () => {
            this.db.load();
            const room = this.db.rooms.find(r => r.id === roomId);
            if (!room || room.status !== 'PLAYING')
                return;
            const player = this.db.players.find(p => p.id === playerId);
            if (!player || player.isBankrupt || !player.isBot)
                return;
            this.gateway.broadcastRoomUpdate(roomId, 'bot_thinking', { playerId, thinking: true });
            const rollDetails = this.rollDice(room.code, playerId);
            this.gateway.broadcastRoomUpdate(roomId, 'bot_thinking', { playerId, thinking: false });
            const movementDelay = (rollDetails.roll * 250) + 3200;
            setTimeout(async () => {
                const resolution = this.resolveLanding(room.code, playerId, rollDetails.to);
                if (resolution.type === 'PROPERTY' && resolution.status === 'UNOWNED') {
                    const landedSlot = { id: rollDetails.to, cost: resolution.cost, rent: resolution.rent };
                    const propertiesOwned = this.db.properties
                        .filter(p => p.roomId === roomId && p.ownerId === playerId)
                        .map(p => p.slotId);
                    const decision = await this.ai.getBotDecision(player.botPersonality || 'BALANCED', { money: player.money, propertiesOwned }, landedSlot, 'BUY');
                    this.addLog(roomId, `Bot ${player.name} decidiu: ${decision.rationale}`, '#F59E0B');
                    if (decision.action === 'BUY' && player.money >= landedSlot.cost) {
                        this.buyProperty(room.code, playerId, landedSlot.id);
                    }
                    else {
                        this.startAuction(room.code, landedSlot.id);
                    }
                }
                setTimeout(() => {
                    this.endTurn(room.code, playerId);
                }, 1500);
            }, movementDelay);
        }, 2000);
    }
    getSlotType(slotId) {
        if (slotId === 0)
            return 'START';
        if (slotId === 4 || slotId === 12)
            return 'TAX';
        if (slotId === 7 || slotId === 17)
            return 'EVENT';
        return 'PROPERTY';
    }
    getCitySlotCost(cityCode, slotId) {
        if (cityCode === 'sao-paulo') {
            const costs = [0, 130, 150, 180, 150, 220, 240, 0, 260, 280, 320, 340, 200, 380, 420, 80, 100, 0, 110, 120];
            return costs[slotId] || 150;
        }
        if (cityCode === 'rio-de-janeiro') {
            const costs = [0, 120, 140, 160, 150, 210, 230, 0, 250, 270, 310, 330, 200, 370, 410, 70, 90, 0, 100, 110];
            return costs[slotId] || 150;
        }
        const costs = [0, 120, 140, 160, 150, 200, 220, 0, 240, 260, 300, 320, 200, 350, 400, 70, 90, 0, 100, 110];
        return costs[slotId] || 150;
    }
    getCitySlotRent(cityCode, slotId) {
        if (cityCode === 'sao-paulo') {
            const rents = [0, 13, 15, 18, 0, 22, 24, 0, 26, 28, 32, 34, 0, 38, 42, 8, 10, 0, 11, 12];
            return rents[slotId] || 15;
        }
        if (cityCode === 'rio-de-janeiro') {
            const rents = [0, 12, 14, 16, 0, 21, 23, 0, 25, 27, 31, 33, 0, 37, 41, 7, 9, 0, 10, 11];
            return rents[slotId] || 15;
        }
        const rents = [0, 12, 14, 16, 0, 20, 22, 0, 24, 26, 30, 32, 0, 35, 40, 7, 9, 0, 10, 11];
        return rents[slotId] || 15;
    }
};
exports.RoomsService = RoomsService;
exports.RoomsService = RoomsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        rooms_gateway_1.RoomsGateway,
        ai_service_1.AiService])
], RoomsService);
//# sourceMappingURL=rooms.service.js.map
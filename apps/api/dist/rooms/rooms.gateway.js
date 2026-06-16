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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const database_service_1 = require("../database/database.service");
let RoomsGateway = class RoomsGateway {
    db;
    server;
    connectedPlayers = new Map();
    constructor(db) {
        this.db = db;
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const playerMapping = this.connectedPlayers.get(client.id);
        if (playerMapping) {
            this.db.load();
            const player = this.db.players.find(p => p.id === playerMapping.playerId);
            if (player) {
                player.isOnline = false;
                this.db.save();
                console.log(`Presence: Player ${player.name} is now OFFLINE`);
                this.broadcastTableUpdate(playerMapping.roomId, 'players', 'UPDATE', player);
            }
            this.connectedPlayers.delete(client.id);
        }
    }
    handleSubscribeRoom(client, data) {
        const { roomCode, playerId } = data;
        if (roomCode) {
            client.join(roomCode);
            console.log(`Client ${client.id} (Player: ${playerId}) joined room code: ${roomCode}`);
            if (playerId && playerId !== 'client-guest') {
                this.db.load();
                const player = this.db.players.find(p => p.id === playerId);
                if (player) {
                    player.isOnline = true;
                    this.db.save();
                    console.log(`Presence: Player ${player.name} is now ONLINE`);
                    this.connectedPlayers.set(client.id, { roomId: roomCode, playerId });
                    this.broadcastTableUpdate(roomCode, 'players', 'UPDATE', player);
                }
            }
            return { status: 'subscribed', roomCode };
        }
        return { status: 'error', message: 'No roomCode provided' };
    }
    handleUnsubscribeRoom(client, data) {
        const { roomCode } = data;
        if (roomCode) {
            client.leave(roomCode);
            console.log(`Client ${client.id} left room code: ${roomCode}`);
            return { status: 'unsubscribed', roomCode };
        }
        return { status: 'error', message: 'No roomCode provided' };
    }
    broadcastRoomUpdate(roomCode, event, payload) {
        if (this.server) {
            this.server.to(roomCode).emit(event, payload);
        }
    }
    broadcastTableUpdate(roomCode, table, event, record) {
        if (this.server) {
            this.server.to(roomCode).emit('postgres_changes', {
                table,
                event,
                record,
            });
        }
    }
};
exports.RoomsGateway = RoomsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RoomsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomsGateway.prototype, "handleSubscribeRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RoomsGateway.prototype, "handleUnsubscribeRoom", null);
exports.RoomsGateway = RoomsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RoomsGateway);
//# sourceMappingURL=rooms.gateway.js.map
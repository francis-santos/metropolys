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
exports.RoomsController = void 0;
const common_1 = require("@nestjs/common");
const rooms_service_1 = require("./rooms.service");
let RoomsController = class RoomsController {
    roomsService;
    constructor(roomsService) {
        this.roomsService = roomsService;
    }
    createRoom(body) {
        if (!body.hostName) {
            throw new common_1.BadRequestException('Host name is required');
        }
        return this.roomsService.createRoom(body.cityCode, body.hostName, body.hostColor, body.hostPin);
    }
    joinRoom(code, body) {
        if (!body.name) {
            throw new common_1.BadRequestException('Player name is required');
        }
        return this.roomsService.joinRoom(code, body.name, body.color, body.isBot, body.botPersonality, body.pin);
    }
    startMatch(code) {
        return this.roomsService.startMatch(code);
    }
    rollDice(code, body) {
        if (!body.playerId) {
            throw new common_1.BadRequestException('Player ID is required');
        }
        return this.roomsService.rollDice(code, body.playerId);
    }
    resolveLanding(code, body) {
        if (!body.playerId || body.slotId === undefined) {
            throw new common_1.BadRequestException('Player ID and Slot ID are required');
        }
        return this.roomsService.resolveLanding(code, body.playerId, body.slotId);
    }
    buyProperty(code, body) {
        if (!body.playerId || body.slotId === undefined) {
            throw new common_1.BadRequestException('Player ID and Slot ID are required');
        }
        return this.roomsService.buyProperty(code, body.playerId, body.slotId);
    }
    endTurn(code, body) {
        if (!body.playerId) {
            throw new common_1.BadRequestException('Player ID is required');
        }
        return this.roomsService.endTurn(code, body.playerId);
    }
    takeLoan(code, body) {
        if (!body.playerId || !body.amount) {
            throw new common_1.BadRequestException('Player ID and Amount are required');
        }
        return this.roomsService.takeLoan(code, body.playerId, body.amount);
    }
    startAuction(code, body) {
        if (body.slotId === undefined) {
            throw new common_1.BadRequestException('Slot ID is required');
        }
        return this.roomsService.startAuction(code, body.slotId);
    }
    placeBid(code, auctionId, body) {
        if (!body.playerId || !body.bidAmount) {
            throw new common_1.BadRequestException('Player ID and Bid Amount are required');
        }
        return this.roomsService.placeBid(code, auctionId, body.playerId, body.bidAmount);
    }
    proposeTrade(code, body) {
        if (!body.senderId || !body.receiverId || body.offerCash === undefined || !body.offerProperties || !body.requestProperties) {
            throw new common_1.BadRequestException('All trade proposal parameters are required');
        }
        return this.roomsService.proposeTrade(code, body.senderId, body.receiverId, body.offerCash, body.offerProperties, body.requestProperties);
    }
    resolveTrade(code, tradeId, body) {
        if (!body.resolution) {
            throw new common_1.BadRequestException('Resolution (ACCEPTED or DECLINED) is required');
        }
        return this.roomsService.resolveTrade(code, tradeId, body.resolution);
    }
};
exports.RoomsController = RoomsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "createRoom", null);
__decorate([
    (0, common_1.Post)(':code/join'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "joinRoom", null);
__decorate([
    (0, common_1.Post)(':code/start'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "startMatch", null);
__decorate([
    (0, common_1.Post)(':code/roll'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "rollDice", null);
__decorate([
    (0, common_1.Post)(':code/resolve'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "resolveLanding", null);
__decorate([
    (0, common_1.Post)(':code/buy'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "buyProperty", null);
__decorate([
    (0, common_1.Post)(':code/end-turn'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "endTurn", null);
__decorate([
    (0, common_1.Post)(':code/loan'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "takeLoan", null);
__decorate([
    (0, common_1.Post)(':code/auctions'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "startAuction", null);
__decorate([
    (0, common_1.Post)(':code/auctions/:id/bid'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "placeBid", null);
__decorate([
    (0, common_1.Post)(':code/trades'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "proposeTrade", null);
__decorate([
    (0, common_1.Post)(':code/trades/:id/resolve'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RoomsController.prototype, "resolveTrade", null);
exports.RoomsController = RoomsController = __decorate([
    (0, common_1.Controller)('api/rooms'),
    __metadata("design:paramtypes", [rooms_service_1.RoomsService])
], RoomsController);
//# sourceMappingURL=rooms.controller.js.map
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
exports.DatabaseController = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("./database.service");
let DatabaseController = class DatabaseController {
    dbService;
    constructor(dbService) {
        this.dbService = dbService;
    }
    getTable(table, query) {
        this.dbService.load();
        let list = [];
        if (table === 'rooms')
            list = this.dbService.rooms;
        else if (table === 'players')
            list = this.dbService.players;
        else if (table === 'properties')
            list = this.dbService.properties;
        else if (table === 'logs')
            list = this.dbService.logs;
        else if (table === 'auctions')
            list = this.dbService.auctions;
        else if (table === 'trades')
            list = this.dbService.trades;
        else if (table === 'ai_news')
            list = this.dbService.aiNews;
        else {
            throw new common_1.NotFoundException(`Table ${table} not found`);
        }
        return list.filter(row => {
            for (const [key, value] of Object.entries(query)) {
                let targetKey = key;
                if (key === 'room_id')
                    targetKey = 'roomId';
                else if (key === 'owner_id')
                    targetKey = 'ownerId';
                else if (key === 'slot_id')
                    targetKey = 'slotId';
                else if (key === 'winner_id')
                    targetKey = 'winnerId';
                else if (key === 'bot_personality')
                    targetKey = 'botPersonality';
                else if (key === 'sender_id')
                    targetKey = 'senderId';
                else if (key === 'receiver_id')
                    targetKey = 'receiverId';
                if (row[targetKey] === undefined) {
                    continue;
                }
                if (String(row[targetKey]) !== String(value)) {
                    return false;
                }
            }
            return true;
        });
    }
};
exports.DatabaseController = DatabaseController;
__decorate([
    (0, common_1.Get)(':table'),
    __param(0, (0, common_1.Param)('table')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DatabaseController.prototype, "getTable", null);
exports.DatabaseController = DatabaseController = __decorate([
    (0, common_1.Controller)('api/db'),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DatabaseController);
//# sourceMappingURL=database.controller.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let DatabaseService = class DatabaseService {
    dbPath = path.join(process.cwd(), 'database.json');
    rooms = [];
    players = [];
    properties = [];
    logs = [];
    auctions = [];
    trades = [];
    aiNews = [];
    onModuleInit() {
        this.load();
    }
    clearAll() {
        this.rooms = [];
        this.players = [];
        this.properties = [];
        this.logs = [];
        this.auctions = [];
        this.trades = [];
        this.aiNews = [];
        this.save();
    }
    save() {
        try {
            const data = {
                rooms: this.rooms,
                players: this.players,
                properties: this.properties,
                logs: this.logs,
                auctions: this.auctions,
                trades: this.trades,
                aiNews: this.aiNews,
            };
            fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
        }
        catch (e) {
            console.error('Failed to save database:', e);
        }
    }
    load() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
                const data = JSON.parse(fileContent);
                this.rooms = data.rooms || [];
                this.players = data.players || [];
                this.properties = data.properties || [];
                this.logs = data.logs || [];
                this.auctions = data.auctions || [];
                this.trades = data.trades || [];
                this.aiNews = data.aiNews || [];
            }
            else {
                this.save();
            }
        }
        catch (e) {
            console.error('Failed to load database:', e);
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map
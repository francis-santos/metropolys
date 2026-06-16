import { RoomsService } from './rooms.service';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    createRoom(body: {
        cityCode: string;
        hostName: string;
        hostColor: string;
        hostPin?: string;
    }): import("../database/database.service").Room;
    joinRoom(code: string, body: {
        name: string;
        color: string;
        isBot?: boolean;
        botPersonality?: string;
        pin?: string;
    }): import("../database/database.service").Player;
    startMatch(code: string): import("../database/database.service").Room;
    rollDice(code: string, body: {
        playerId: string;
    }): any;
    resolveLanding(code: string, body: {
        playerId: string;
        slotId: number;
    }): any;
    buyProperty(code: string, body: {
        playerId: string;
        slotId: number;
    }): import("../database/database.service").Property;
    endTurn(code: string, body: {
        playerId: string;
    }): Promise<import("../database/database.service").Room>;
    takeLoan(code: string, body: {
        playerId: string;
        amount: number;
    }): any;
    startAuction(code: string, body: {
        slotId: number;
    }): import("../database/database.service").Auction;
    placeBid(code: string, auctionId: string, body: {
        playerId: string;
        bidAmount: number;
    }): import("../database/database.service").Auction;
    proposeTrade(code: string, body: {
        senderId: string;
        receiverId: string;
        offerCash: number;
        offerProperties: number[];
        requestProperties: number[];
    }): import("../database/database.service").Trade;
    resolveTrade(code: string, tradeId: string, body: {
        resolution: 'ACCEPTED' | 'DECLINED';
    }): import("../database/database.service").Trade;
}

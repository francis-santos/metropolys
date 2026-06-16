import { OnModuleInit } from '@nestjs/common';
export interface Room {
    id: string;
    code: string;
    status: 'LOBBY' | 'PLAYING' | 'FINISHED';
    cityCode: string;
    currentRound: number;
    bankingLiquidity: number;
    interestRate: number;
    economicCycle: 'EXPANSION' | 'RECESSION' | 'RECOVERY';
    activeEventName: string | null;
    activeEventModifier: number;
    winnerId: string | null;
    createdAt: string;
}
export interface Player {
    id: string;
    roomId: string;
    name: string;
    color: string;
    money: number;
    position: number;
    isBankrupt: boolean;
    isHost: boolean;
    isBot: boolean;
    botPersonality: 'AGGRESSIVE' | 'CONSERVATIVE' | 'BALANCED' | null;
    isOnline: boolean;
    pin: string | null;
}
export interface Property {
    roomId: string;
    slotId: number;
    ownerId: string | null;
    baseCost: number;
    currentRent: number;
    multiplier: number;
}
export interface Log {
    id: string;
    roomId: string;
    text: string;
    color: string | null;
    createdAt: string;
}
export interface Auction {
    id: string;
    roomId: string;
    slotId: number;
    highestBid: number;
    highestBidderId: string | null;
    endsAt: string;
    status: 'ACTIVE' | 'FINISHED';
}
export interface Trade {
    id: string;
    roomId: string;
    senderId: string;
    receiverId: string;
    offerCash: number;
    offerProperties: number[];
    requestProperties: number[];
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}
export interface AiNews {
    id: string;
    roomId: string;
    headline: string;
    body: string;
    createdAt: string;
}
export declare class DatabaseService implements OnModuleInit {
    private dbPath;
    rooms: Room[];
    players: Player[];
    properties: Property[];
    logs: Log[];
    auctions: Auction[];
    trades: Trade[];
    aiNews: AiNews[];
    onModuleInit(): void;
    clearAll(): void;
    save(): void;
    load(): void;
}

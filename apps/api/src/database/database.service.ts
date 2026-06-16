import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface Room {
  id: string; // uuid
  code: string; // 6-digit code
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  cityCode: string;
  currentRound: number;
  bankingLiquidity: number; // starts at 10000
  interestRate: number; // starts at 5% (0.05)
  economicCycle: 'EXPANSION' | 'RECESSION' | 'RECOVERY';
  activeEventName: string | null;
  activeEventModifier: number; // e.g. 1.0, 1.5, 0.8
  winnerId: string | null;
  createdAt: string;
}

export interface Player {
  id: string; // uuid
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
  multiplier: number; // temporary multipliers (e.g. city-wide events)
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
  offerProperties: number[]; // array of slotIds
  requestProperties: number[]; // array of slotIds
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
}

export interface AiNews {
  id: string;
  roomId: string;
  headline: string;
  body: string;
  createdAt: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private dbPath = path.join(process.cwd(), 'database.json');
  
  public rooms: Room[] = [];
  public players: Player[] = [];
  public properties: Property[] = [];
  public logs: Log[] = [];
  public auctions: Auction[] = [];
  public trades: Trade[] = [];
  public aiNews: AiNews[] = [];

  onModuleInit() {
    this.load();
  }

  public clearAll() {
    this.rooms = [];
    this.players = [];
    this.properties = [];
    this.logs = [];
    this.auctions = [];
    this.trades = [];
    this.aiNews = [];
    this.save();
  }

  public save() {
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
    } catch (e) {
      console.error('Failed to save database:', e);
    }
  }

  public load() {
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
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database:', e);
    }
  }
}

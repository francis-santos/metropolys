import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export interface Room {
  id: string; // uuid
  code: string; // 6-digit code
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
  id?: string;
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

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pgPool: Pool;

  public rooms: Room[] = [];
  public players: Player[] = [];
  public properties: Property[] = [];
  public logs: Log[] = [];
  public auctions: Auction[] = [];
  public trades: Trade[] = [];
  public aiNews: AiNews[] = [];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      console.warn('Missing DATABASE_URL');
      return;
    }

    // Use connection pool to support concurrent queries and safe transaction states
    this.pgPool = new Pool({ connectionString: databaseUrl, max: 10 });
    try {
      console.log('Connected to PostgreSQL via pg Pool');
      // Force initial load
      await this.load();
    } catch (e) {
      console.error('Failed to connect to PostgreSQL pool', e);
    }
  }

  async onModuleDestroy() {
    if (this.pgPool) {
      await this.pgPool.end();
    }
  }

  get pool() {
    return this.pgPool;
  }

  async load() {
    if (!this.pgPool) return;
    try {
      const [r, p, pr, l, a, t, ai] = await Promise.all([
        this.pgPool.query('SELECT * FROM rooms'),
        this.pgPool.query('SELECT * FROM players'),
        this.pgPool.query('SELECT * FROM properties'),
        this.pgPool.query('SELECT * FROM logs'),
        this.pgPool.query('SELECT * FROM auctions'),
        this.pgPool.query('SELECT * FROM trades'),
        this.pgPool.query('SELECT * FROM ai_news')
      ]);

      this.rooms = r.rows;
      this.players = p.rows;
      this.properties = pr.rows;
      this.logs = l.rows;
      this.auctions = a.rows;
      this.trades = t.rows;
      this.aiNews = ai.rows;
    } catch (e) {
      console.error('Failed to load database from Postgres:', e);
    }
  }

  async save() {
    if (!this.pgPool) return;
    
    const client = await this.pgPool.connect();
    try {
      await client.query('BEGIN');
      
      // Upsert Rooms
      for (const room of this.rooms) {
        await client.query(
          `INSERT INTO rooms ("id", "code", "status", "cityCode", "currentRound", "bankingLiquidity", "interestRate", "economicCycle", "activeEventName", "activeEventModifier", "winnerId", "createdAt") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             "code" = EXCLUDED."code",
             "status" = EXCLUDED."status",
             "cityCode" = EXCLUDED."cityCode",
             "currentRound" = EXCLUDED."currentRound",
             "bankingLiquidity" = EXCLUDED."bankingLiquidity",
             "interestRate" = EXCLUDED."interestRate",
             "economicCycle" = EXCLUDED."economicCycle",
             "activeEventName" = EXCLUDED."activeEventName",
             "activeEventModifier" = EXCLUDED."activeEventModifier",
             "winnerId" = EXCLUDED."winnerId"`,
          [room.id, room.code, room.status, room.cityCode, room.currentRound, room.bankingLiquidity, room.interestRate, room.economicCycle, room.activeEventName, room.activeEventModifier, room.winnerId, room.createdAt || new Date().toISOString()]
        );
      }

      // Upsert Players
      for (const player of this.players) {
        await client.query(
          `INSERT INTO players ("id", "roomId", "name", "color", "money", "position", "isBankrupt", "isHost", "isBot", "botPersonality", "isOnline", "pin") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (id) DO UPDATE SET
             "roomId" = EXCLUDED."roomId",
             "name" = EXCLUDED."name",
             "color" = EXCLUDED."color",
             "money" = EXCLUDED."money",
             "position" = EXCLUDED."position",
             "isBankrupt" = EXCLUDED."isBankrupt",
             "isHost" = EXCLUDED."isHost",
             "isBot" = EXCLUDED."isBot",
             "botPersonality" = EXCLUDED."botPersonality",
             "isOnline" = EXCLUDED."isOnline",
             "pin" = EXCLUDED."pin"`,
          [player.id, player.roomId, player.name, player.color, player.money, player.position, player.isBankrupt, player.isHost, player.isBot, player.botPersonality, player.isOnline, player.pin]
        );
      }

      // Upsert Properties
      for (const prop of this.properties) {
        await client.query(
          `INSERT INTO properties ("id", "roomId", "slotId", "ownerId", "baseCost", "currentRent", "multiplier") 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             "roomId" = EXCLUDED."roomId",
             "slotId" = EXCLUDED."slotId",
             "ownerId" = EXCLUDED."ownerId",
             "baseCost" = EXCLUDED."baseCost",
             "currentRent" = EXCLUDED."currentRent",
             "multiplier" = EXCLUDED."multiplier"`,
          [prop.id || 'prop-' + Math.random(), prop.roomId, prop.slotId, prop.ownerId, prop.baseCost, prop.currentRent, prop.multiplier]
        );
      }

      // Upsert Logs
      for (const log of this.logs) {
        await client.query(
          `INSERT INTO logs ("id", "roomId", "text", "color", "createdAt") 
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             "roomId" = EXCLUDED."roomId",
             "text" = EXCLUDED."text",
             "color" = EXCLUDED."color"`,
          [log.id, log.roomId, log.text, log.color, log.createdAt || new Date().toISOString()]
        );
      }

      // Upsert Auctions
      for (const auc of this.auctions) {
        await client.query(
          `INSERT INTO auctions ("id", "roomId", "slotId", "highestBid", "highestBidderId", "endsAt", "status") 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             "roomId" = EXCLUDED."roomId",
             "slotId" = EXCLUDED."slotId",
             "highestBid" = EXCLUDED."highestBid",
             "highestBidderId" = EXCLUDED."highestBidderId",
             "endsAt" = EXCLUDED."endsAt",
             "status" = EXCLUDED."status"`,
          [auc.id, auc.roomId, auc.slotId, auc.highestBid, auc.highestBidderId, auc.endsAt, auc.status]
        );
      }

      // Upsert Trades
      for (const trade of this.trades) {
        await client.query(
          `INSERT INTO trades ("id", "roomId", "senderId", "receiverId", "offerCash", "offerProperties", "requestProperties", "status") 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
             "roomId" = EXCLUDED."roomId",
             "senderId" = EXCLUDED."senderId",
             "receiverId" = EXCLUDED."receiverId",
             "offerCash" = EXCLUDED."offerCash",
             "offerProperties" = EXCLUDED."offerProperties",
             "requestProperties" = EXCLUDED."requestProperties",
             "status" = EXCLUDED."status"`,
          [trade.id, trade.roomId, trade.senderId, trade.receiverId, trade.offerCash, trade.offerProperties, trade.requestProperties, trade.status]
        );
      }

      // Upsert AiNews
      for (const news of this.aiNews) {
        await client.query(
          `INSERT INTO ai_news ("id", "roomId", "headline", "body", "createdAt") 
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO UPDATE SET
             "roomId" = EXCLUDED."roomId",
             "headline" = EXCLUDED."headline",
             "body" = EXCLUDED."body"`,
          [news.id, news.roomId, news.headline, news.body, news.createdAt || new Date().toISOString()]
        );
      }

      // Sync deletes for entities not in current memory state anymore
      if (this.rooms.length > 0) {
        const roomIds = this.rooms.map(r => r.id);
        await client.query('DELETE FROM rooms WHERE id NOT IN (SELECT unnest($1::varchar[]))', [roomIds]);
      } else {
        await client.query('DELETE FROM rooms');
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Failed to save database to Postgres:', e);
    } finally {
      client.release();
    }
  }

  async clearAll() {
    this.rooms = [];
    this.players = [];
    this.properties = [];
    this.logs = [];
    this.auctions = [];
    this.trades = [];
    this.aiNews = [];
  }
}

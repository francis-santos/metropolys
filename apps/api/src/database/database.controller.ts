import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('api/db')
export class DatabaseController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get(':table')
  async getTable(@Param('table') table: string, @Query() query: any) {
    await this.dbService.load();
    let list: any[] = [];
    
    if (table === 'rooms') list = this.dbService.rooms;
    else if (table === 'players') list = this.dbService.players;
    else if (table === 'properties') list = this.dbService.properties;
    else if (table === 'logs') list = this.dbService.logs;
    else if (table === 'auctions') list = this.dbService.auctions;
    else if (table === 'trades') list = this.dbService.trades;
    else if (table === 'ai_news') list = this.dbService.aiNews;
    else {
      throw new NotFoundException(`Table ${table} not found`);
    }

    // Apply filters from query params
    return list.filter(row => {
      for (const [key, value] of Object.entries(query)) {
        // Map database schema snake_case fields to TypeScript camelCase fields
        let targetKey = key;
        if (key === 'room_id') targetKey = 'roomId';
        else if (key === 'owner_id') targetKey = 'ownerId';
        else if (key === 'slot_id') targetKey = 'slotId';
        else if (key === 'winner_id') targetKey = 'winnerId';
        else if (key === 'bot_personality') targetKey = 'botPersonality';
        else if (key === 'sender_id') targetKey = 'senderId';
        else if (key === 'receiver_id') targetKey = 'receiverId';

        if (row[targetKey] === undefined) {
          continue; // skip if key doesn't exist on row
        }

        // Compare string representation to be agnostic of number/string differences
        if (String(row[targetKey]) !== String(value)) {
          return false;
        }
      }
      return true;
    });
  }
}

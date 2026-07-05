import { Controller, Post, Get, Param, Body, BadRequestException } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(@Body() body: { cityCode: string; hostName: string; hostColor: string; hostPin?: string }) {
    if (!body.hostName) {
      throw new BadRequestException('Host name is required');
    }
    return await this.roomsService.createRoom(body.cityCode, body.hostName, body.hostColor, body.hostPin);
  }

  @Post(':code/join')
  async joinRoom(
    @Param('code') code: string,
    @Body() body: { name: string; color: string; isBot?: boolean; botPersonality?: string; pin?: string },
  ) {
    if (!body.name) {
      throw new BadRequestException('Player name is required');
    }
    return await this.roomsService.joinRoom(code, body.name, body.color, body.isBot, body.botPersonality, body.pin);
  }

  @Post(':code/start')
  async startMatch(@Param('code') code: string) {
    return await this.roomsService.startMatch(code);
  }

  @Post(':code/roll')
  async rollDice(@Param('code') code: string, @Body() body: { playerId: string }) {
    if (!body.playerId) {
      throw new BadRequestException('Player ID is required');
    }
    return await this.roomsService.rollDice(code, body.playerId);
  }

  @Post(':code/resolve')
  async resolveLanding(
    @Param('code') code: string,
    @Body() body: { playerId: string; slotId: number },
  ) {
    if (!body.playerId || body.slotId === undefined) {
      throw new BadRequestException('Player ID and Slot ID are required');
    }
    return await this.roomsService.resolveLanding(code, body.playerId, body.slotId);
  }

  @Post(':code/buy')
  async buyProperty(
    @Param('code') code: string,
    @Body() body: { playerId: string; slotId: number },
  ) {
    if (!body.playerId || body.slotId === undefined) {
      throw new BadRequestException('Player ID and Slot ID are required');
    }
    return await this.roomsService.buyProperty(code, body.playerId, body.slotId);
  }

  @Post(':code/end-turn')
  async endTurn(@Param('code') code: string, @Body() body: { playerId: string }) {
    if (!body.playerId) {
      throw new BadRequestException('Player ID is required');
    }
    return await this.roomsService.endTurn(code, body.playerId);
  }

  @Post(':code/loan')
  async takeLoan(
    @Param('code') code: string,
    @Body() body: { playerId: string; amount: number },
  ) {
    if (!body.playerId || !body.amount) {
      throw new BadRequestException('Player ID and Amount are required');
    }
    return await this.roomsService.takeLoan(code, body.playerId, body.amount);
  }

  // --- AUCTIONS (MVP 3) ---

  @Post(':code/auctions')
  async startAuction(@Param('code') code: string, @Body() body: { slotId: number }) {
    if (body.slotId === undefined) {
      throw new BadRequestException('Slot ID is required');
    }
    return await this.roomsService.startAuction(code, body.slotId);
  }

  @Post(':code/auctions/:id/bid')
  async placeBid(
    @Param('code') code: string,
    @Param('id') auctionId: string,
    @Body() body: { playerId: string; bidAmount: number },
  ) {
    if (!body.playerId || !body.bidAmount) {
      throw new BadRequestException('Player ID and Bid Amount are required');
    }
    return await this.roomsService.placeBid(code, auctionId, body.playerId, body.bidAmount);
  }

  // --- TRADES (MVP 3) ---

  @Post(':code/trades')
  async proposeTrade(
    @Param('code') code: string,
    @Body() body: {
      senderId: string;
      receiverId: string;
      offerCash: number;
      offerProperties: number[];
      requestProperties: number[];
    },
  ) {
    if (!body.senderId || !body.receiverId || body.offerCash === undefined || !body.offerProperties || !body.requestProperties) {
      throw new BadRequestException('All trade proposal parameters are required');
    }
    return await this.roomsService.proposeTrade(
      code,
      body.senderId,
      body.receiverId,
      body.offerCash,
      body.offerProperties,
      body.requestProperties,
    );
  }

  @Post(':code/trades/:id/resolve')
  async resolveTrade(
    @Param('code') code: string,
    @Param('id') tradeId: string,
    @Body() body: { resolution: 'ACCEPTED' | 'DECLINED' },
  ) {
    if (!body.resolution) {
      throw new BadRequestException('Resolution (ACCEPTED or DECLINED) is required');
    }
    return await this.roomsService.resolveTrade(code, tradeId, body.resolution);
  }
}
